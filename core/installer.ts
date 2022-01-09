import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as io from "@actions/io";
import axios from "axios";
import * as exec from "@actions/exec";
const execSync = require("child_process");

export function version() {
  return axios
    .get("https://get-latest.secman.dev/abdfnx/resto")
    .then((response) => {
      return response.data;
    });
}

const workspace = process.env.GITHUB_WORKSPACE;
export const binDir = `${workspace}/bin`;

export async function installZip(path, url) {
  await io.mkdirP(path);
  const downloadPath = await tc.downloadTool(url);
  await tc.extractZip(downloadPath, path);

  core.addPath(path);
}

export async function executeInstallSh(installPath) {
  // download script
  const url = "https://git.io/resto";
  const downloadPath = await tc.downloadTool(url);
  execSync(`chmod +x ${downloadPath}`);

  // execute script
  await io.mkdirP(installPath);
  const installCommand = `${downloadPath}`;
  let stdout = execSync(installCommand, { timeout: 30000 });
  console.log(Buffer.from(stdout).toString("utf-8"));

  // add binary to PATH
  core.addPath(installPath);
}

export const install = async () => {
  switch (process.platform) {
    case "win32": {
      await exec.exec("iwr -useb https://git.io/resto-win | iex");
      core.addPath("C:/Users/runneradmin/AppData/Local/resto/bin/;");
      break;
    }

    case "linux":
    case "darwin": {
      await exec.exec("curl -sL https://git.io/resto | bash");
      core.addPath("/usr/local/bin/resto");
      break;
    }

    default: {
      throw new Error(`Unsupported platform '${process.platform}'`);
    }
  }
};
