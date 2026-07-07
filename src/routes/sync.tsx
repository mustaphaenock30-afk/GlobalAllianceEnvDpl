import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { initAuth, googleSignIn, logout, getAccessToken } from "@/lib/auth";
import { saveImageToServer } from "@/lib/images.functions";
import { saveImageToLocalDB } from "@/lib/images";
import { toast } from "sonner";
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FolderDot,
  Image,
  Loader2,
  Lock,
  UserCheck,
  LogOut,
  FolderSync,
  Sparkles,
  Home,
  FileImage,
} from "lucide-react";
import type { User } from "firebase/auth";

export const Route = createFileRoute("/sync")({
  head: () => ({
    meta: [
      { title: "Sync Google Drive Assets · Global Alliance on Environment" },
      {
        name: "description",
        content: "Synchronize clean, uncorrupted environmental assets from Google Drive.",
      },
    ],
  }),
  component: SyncPage,
});

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

interface SyncItem {
  filename: string;
  status: "idle" | "pending" | "success" | "failed";
  size?: number;
  error?: string;
}

function SyncPage() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [targetFolder, setTargetFolder] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<SyncItem[]>([]);
  const [currentStep, setCurrentStep] = useState<string>("");

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      },
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
        toast.success("Signed in successfully with Google Drive permission!");
      }
    } catch (err: unknown) {
      console.error("Login failed:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      toast.error(`Login failed: ${errMsg}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setNeedsAuth(true);
      setDriveFiles([]);
      setTargetFolder(null);
      setSyncProgress([]);
      toast.success("Signed out successfully.");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      toast.error(`Sign out failed: ${errMsg}`);
    }
  };

  const log = (msg: string) => {
    setSyncLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const convertBlobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          // Strip "data:image/jpeg;base64," etc.
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        } else {
          reject(new Error("Failed to read blob as string"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const startSynchronization = async () => {
    const activeToken = token || (await getAccessToken());
    if (!activeToken) {
      toast.error("Authentication token missing. Please sign in again.");
      setNeedsAuth(true);
      return;
    }

    setIsSyncing(true);
    setSyncLogs([]);
    setSyncProgress([]);
    setCurrentStep("Connecting to Google Drive...");
    log("Starting synchronization process...");

    try {
      // Step 1: Find the 'public' folder
      setCurrentStep("Searching for 'public' folder in Google Drive...");
      log("Searching for folders named 'public'...");

      const folderUrl = `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.folder' and name='public' and trashed=false&fields=files(id,name)`;
      const folderRes = await fetch(folderUrl, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });

      if (!folderRes.ok) {
        throw new Error(`Failed to query Google Drive folder list: ${folderRes.statusText}`);
      }

      const folderData = await folderRes.json();
      const folders = folderData.files || [];

      let filesToSync: DriveFile[] = [];

      if (folders.length > 0) {
        const publicFolder = folders[0];
        setTargetFolder(publicFolder.name);
        log(`Found public folder with ID: ${publicFolder.id}`);
        setCurrentStep(`Listing files inside 'public' folder...`);

        // Get files inside the 'public' folder
        const filesUrl = `https://www.googleapis.com/drive/v3/files?q='${publicFolder.id}' in parents and trashed=false&pageSize=1000&fields=files(id,name,mimeType)`;
        const filesRes = await fetch(filesUrl, {
          headers: { Authorization: `Bearer ${activeToken}` },
        });

        if (!filesRes.ok) {
          throw new Error(`Failed to list files inside public folder: ${filesRes.statusText}`);
        }

        const filesData = await filesRes.json();
        filesToSync = (filesData.files || []).filter((f: DriveFile) =>
          f.mimeType.startsWith("image/"),
        );
        log(`Found ${filesToSync.length} images inside 'public' folder.`);
      } else {
        log(
          "No folder named 'public' found in your Drive. Searching for any matching images in your root Drive...",
        );
        setCurrentStep("No 'public' folder found. Searching all images in Drive instead...");

        // Fallback: search for any images in Drive that match our target names
        const allImagesUrl = `https://www.googleapis.com/drive/v3/files?q=mimeType contains 'image/' and trashed=false&pageSize=1000&fields=files(id,name,mimeType)`;
        const allImagesRes = await fetch(allImagesUrl, {
          headers: { Authorization: `Bearer ${activeToken}` },
        });

        if (!allImagesRes.ok) {
          throw new Error(`Failed to list image files: ${allImagesRes.statusText}`);
        }

        const allImagesData = await allImagesRes.json();
        filesToSync = allImagesData.files || [];
        log(`Found ${filesToSync.length} image files in your Google Drive.`);
      }

      if (filesToSync.length === 0) {
        log("No image files discovered to sync.");
        toast.warning("No image files found in Google Drive.");
        setIsSyncing(false);
        setCurrentStep("Sync finished with warning (no images found)");
        return;
      }

      setDriveFiles(filesToSync);

      // Initialize progress states
      const initialProgress = filesToSync.map((f) => ({
        filename: f.name,
        status: "idle" as const,
      }));
      setSyncProgress(initialProgress);

      log("Initiating file downloads and saves...");
      setCurrentStep("Downloading and writing image assets to server disk...");

      let successCount = 0;

      // Sync sequentially or in small chunks to avoid memory/rate limits
      for (let i = 0; i < filesToSync.length; i++) {
        const file = filesToSync[i];
        log(`Downloading file (${i + 1}/${filesToSync.length}): ${file.name}...`);

        setSyncProgress((prev) =>
          prev.map((item) =>
            item.filename === file.name ? { ...item, status: "pending" as const } : item,
          ),
        );

        try {
          // Download media content
          const mediaUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
          const mediaRes = await fetch(mediaUrl, {
            headers: { Authorization: `Bearer ${activeToken}` },
          });

          if (!mediaRes.ok) {
            throw new Error(`HTTP Error ${mediaRes.status}`);
          }

          const blob = await mediaRes.blob();
          const base64 = await convertBlobToBase64(blob);

          log(`Uploading ${file.name} to server disk...`);

          // Call TanStack Start Server Function to write to local public/images directory
          const response = await saveImageToServer({
            data: {
              filename: file.name,
              base64Data: base64,
            },
          });

          if (response.success) {
            // Also write to browser IndexedDB
            try {
              await saveImageToLocalDB(file.name, base64);
            } catch (localDbErr) {
              console.error("[Cache] Failed to save to local IndexedDB during sync:", localDbErr);
            }

            log(`Successfully synced ${file.name} (${Math.round(response.size / 1024)} KB)`);
            successCount++;
            setSyncProgress((prev) =>
              prev.map((item) =>
                item.filename === file.name
                  ? { ...item, status: "success" as const, size: response.size }
                  : item,
              ),
            );
          } else {
            throw new Error("Server rejected file write operation.");
          }
        } catch (fileErr: unknown) {
          const errStr = fileErr instanceof Error ? fileErr.message : String(fileErr);
          log(`⚠️ Failed to sync ${file.name}: ${errStr}`);
          setSyncProgress((prev) =>
            prev.map((item) =>
              item.filename === file.name
                ? { ...item, status: "failed" as const, error: errStr }
                : item,
            ),
          );
        }
      }

      setCurrentStep("Synchronization complete!");
      log(
        `Sync finished: Successfully updated ${successCount} out of ${filesToSync.length} assets on disk.`,
      );

      if (successCount > 0) {
        window.localStorage.setItem("images_synced", "true");
      }

      toast.success(`Successfully synchronized ${successCount} assets!`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      log(`🔴 Critical Error during sync: ${errMsg}`);
      setCurrentStep("Sync failed due to an error");
      toast.error(`Sync failed: ${errMsg}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <SiteLayout>
      <div className="relative isolate overflow-hidden bg-primary py-16 text-primary-foreground sm:py-20">
        <div className="container-page">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
                Asset Sync Dashboard
              </h1>
              <p className="mt-2 text-lg text-primary-foreground/80 max-w-2xl">
                Connect your Google Drive to locate the public folder and replace corrupted images
                directly on the local web server.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 transition"
            >
              <Home className="h-4 w-4" />
              Back Home
            </Link>
          </div>
        </div>
      </div>

      <div className="container-page py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
              <h2 className="flex items-center gap-2 text-xl font-bold font-display">
                <FolderSync className="h-5 w-5 text-primary" />
                Google Drive Sync Tool
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This utility logs into the authorized Google account, finds the directory named{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono font-semibold">
                  public
                </code>{" "}
                shared in the drive, and downloads its images directly onto the web application
                storage to fix the local image assets.
              </p>

              {needsAuth ? (
                <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 px-4 text-center">
                  <Lock className="h-10 w-10 text-muted-foreground/60 mb-3" />
                  <h3 className="font-semibold text-base">Google Authorization Required</h3>
                  <p className="mt-1 text-sm text-muted-foreground max-w-md">
                    To access the public folder in Google Drive, authorize the app to securely view
                    and download your files.
                  </p>
                  <button
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    className="gsi-material-button mt-6 inline-flex items-center"
                  >
                    <div className="gsi-material-button-state"></div>
                    <div className="gsi-material-button-content-wrapper">
                      <div className="gsi-material-button-icon">
                        {isLoggingIn ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <svg
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 48 48"
                            style={{ display: "block" }}
                          >
                            <path
                              fill="#EA4335"
                              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                            ></path>
                            <path
                              fill="#4285F4"
                              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                            ></path>
                            <path
                              fill="#FBBC05"
                              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                            ></path>
                            <path
                              fill="#34A853"
                              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                            ></path>
                            <path fill="none" d="M0 0h48v48H0z"></path>
                          </svg>
                        )}
                      </div>
                      <span className="gsi-material-button-contents font-sans">
                        {isLoggingIn ? "Signing In..." : "Sign in with Google"}
                      </span>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  {/* Logged in User state */}
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-muted/40 p-4">
                    <div className="flex items-center gap-3">
                      {user?.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt=""
                          className="h-9 w-9 rounded-full border border-border"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                          {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5 font-semibold text-sm">
                          <UserCheck className="h-4 w-4 text-emerald-600" />
                          Authorized
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {user?.displayName} ({user?.email})
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/5 transition"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>

                  {/* Sync Trigger and Status */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={startSynchronization}
                      disabled={isSyncing}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition"
                    >
                      {isSyncing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      {isSyncing ? "Syncing Google Drive Assets..." : "Sync Images Now"}
                    </button>

                    {targetFolder && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <FolderDot className="h-4 w-4 text-primary" />
                        Targeting folder: <span className="font-bold">{targetFolder}</span>
                      </div>
                    )}
                  </div>

                  {/* Log console */}
                  {currentStep && (
                    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Current Operation
                        </span>
                        {isSyncing && (
                          <span className="flex items-center gap-1.5 text-xs text-primary font-medium">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            In Progress
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold">{currentStep}</div>
                    </div>
                  )}

                  {syncLogs.length > 0 && (
                    <div className="rounded-xl border border-border bg-slate-950 p-4 font-mono text-xs text-slate-200">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-slate-400">
                        <span>Console Output</span>
                        <span>{syncLogs.length} entries</span>
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-thin">
                        {syncLogs.map((logStr, i) => (
                          <div key={i} className="leading-relaxed">
                            {logStr}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sync Progress Details Grid */}
            {syncProgress.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
                <h3 className="text-lg font-bold font-display flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                  Assets Sync Status
                </h3>
                <p className="mt-1 text-xs text-muted-foreground mb-4">
                  Individual file downloads from your Google Drive folder and local write status.
                </p>
                <div className="grid gap-3 sm:grid-cols-2 max-h-96 overflow-y-auto pr-1">
                  {syncProgress.map((item) => (
                    <div
                      key={item.filename}
                      className={`flex items-center justify-between rounded-xl border p-3 text-xs font-medium transition ${
                        item.status === "success"
                          ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-950 dark:text-emerald-300"
                          : item.status === "failed"
                            ? "border-destructive/30 bg-destructive/5 text-destructive-foreground"
                            : item.status === "pending"
                              ? "border-primary/40 bg-primary/5 text-primary"
                              : "border-border bg-muted/20 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileImage className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{item.filename}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.status === "success" && (
                          <>
                            <span className="text-[10px] text-muted-foreground font-normal">
                              {item.size ? `${Math.round(item.size / 1024)} KB` : "OK"}
                            </span>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          </>
                        )}
                        {item.status === "failed" && (
                          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                        )}
                        {item.status === "pending" && (
                          <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
                        )}
                        {item.status === "idle" && (
                          <span className="text-[10px] uppercase font-semibold text-muted-foreground/60 tracking-wider">
                            Idle
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Guidelines Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
              <h3 className="font-bold text-base font-display">Target Directory Setup</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                To guarantee that your custom files are correctly mapped and displayed, make sure
                they exist inside a folder named <span className="font-bold">public</span> on your
                Google Drive, using the following exact file names:
              </p>

              <div className="mt-4 border-t border-border pt-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  System Core Icons
                </span>
                <ul className="space-y-1.5 font-mono text-[11px] text-muted-foreground leading-relaxed">
                  <li>Logo3.jpg (Main Logo)</li>
                </ul>
              </div>

              <div className="mt-4 border-t border-border pt-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  Team Portrais
                </span>
                <ul className="space-y-1.5 font-mono text-[11px] text-muted-foreground leading-relaxed">
                  <li>Founder.jpg</li>
                  <li>Director.jpeg</li>
                  <li>Director2.jpg</li>
                  <li>Engineer.jpeg</li>
                  <li>Engineer2.jpeg</li>
                  <li>Secretary.jpg</li>
                  <li>Stapha.jpg</li>
                  <li>Teteh.jpg</li>
                  <li>Jake.jpg</li>
                </ul>
              </div>

              <div className="mt-4 border-t border-border pt-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  Environmental Themes
                </span>
                <ul className="space-y-1.5 font-mono text-[11px] text-muted-foreground leading-relaxed">
                  <li>Afforestation.jpeg</li>
                  <li>ClimateChange.jpeg</li>
                  <li>CleanWater.jpg</li>
                  <li>Conservation.jpg</li>
                  <li>CapacityBuilding.jpg</li>
                  <li>PublicEducation.jpeg</li>
                  <li>LandRestoration.jpg</li>
                  <li>Sustainable.jpeg</li>
                  <li>Awareness.png</li>
                </ul>
              </div>

              <div className="mt-4 border-t border-border pt-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  Projects & Field Gallery
                </span>
                <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">
                  Individual photographs inside the main Gallery grid:
                </p>
                <ul className="space-y-1.5 font-mono text-[11px] text-muted-foreground leading-relaxed">
                  <li>Gallery1.jpg to Gallery40.jpeg</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
