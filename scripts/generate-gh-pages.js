import fs from "fs";
import path from "path";

const distPublic = path.resolve("dist");
const outputPublic = path.resolve(".output/public");

const targetDirs = [distPublic, outputPublic];

for (const targetDir of targetDirs) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  let indexPath = path.join(targetDir, "index.html");
  if (!fs.existsSync(indexPath)) {
    const rootIndex = path.resolve("index.html");
    if (fs.existsSync(rootIndex)) {
      fs.copyFileSync(rootIndex, indexPath);
    }
  }

  if (fs.existsSync(indexPath)) {
    let indexContent = fs.readFileSync(indexPath, "utf-8");
    if (!indexContent.includes("Cache-Control")) {
      indexContent = indexContent.replace(
        "<head>",
        `<head>\n    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />\n    <meta http-equiv="Pragma" content="no-cache" />\n    <meta http-equiv="Expires" content="0" />`
      );
      fs.writeFileSync(indexPath, indexContent);
    }
    fs.writeFileSync(path.join(targetDir, "404.html"), indexContent);
  }

  fs.writeFileSync(path.join(targetDir, "CNAME"), "www.kadha.shop\n");
  fs.writeFileSync(path.join(targetDir, ".nojekyll"), "");
}

console.log("Successfully prepared dist and .output/public for GitHub Pages");
