const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const apps = [
  { name: "customer-app", dir: "frontend/customer-app", dest: "dist" },
  { name: "seller-app", dir: "frontend/seller-app", dest: "dist/seller" },
  { name: "admin-app", dir: "frontend/admin-app", dest: "dist/admin" },
  { name: "delivery-app", dir: "frontend/delivery-app", dest: "dist/delivery" },
];

function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  fs.readdirSync(from).forEach((element) => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

console.log("=== Building All Marketplace Apps for Production ===");

// 1. Install dependencies & build each app
for (const app of apps) {
  const appPath = path.join(rootDir, app.dir);

  // Install sub-app dependencies (including devDependencies like vite)
  // Use npm ci if a lockfile exists for faster, deterministic installs; fallback to npm install
  const lockfilePath = path.join(appPath, "package-lock.json");
  const installCmd = fs.existsSync(lockfilePath) ? "npm ci" : "npm install";
  console.log(`\nInstalling dependencies for ${app.name} (${installCmd})...`);
  execSync(installCmd, { cwd: appPath, stdio: "inherit" });

  console.log(`Building ${app.name} in ${app.dir}...`);
  execSync("npm run build", { cwd: appPath, stdio: "inherit" });
}

// 2. Clean root dist
const distPath = path.join(rootDir, "dist");
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
}
fs.mkdirSync(distPath, { recursive: true });

// 3. Assemble unified dist
for (const app of apps) {
  const srcDist = path.join(rootDir, app.dir, "dist");
  const targetDist = path.join(rootDir, app.dest);
  console.log(`Copying ${app.name} (${srcDist}) -> ${targetDist}...`);
  copyFolderSync(srcDist, targetDist);
}

console.log("\n✓ All apps successfully assembled in root /dist!");
