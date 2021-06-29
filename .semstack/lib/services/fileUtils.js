import fs from 'fs'
import fse from 'fs-extra'

export const getDirectories = source =>
  fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

export const createDirIfNone = dir => {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
}

export const copyFolder = (srcDir, destDir) => {
  fse.copySync(srcDir, destDir, { overwrite: true }, function (err) {
    if (err) {
      console.error('** ERROR **: Error copying directory:', srcDir, destDir, err);
    } else {
      console.log("success!");
    }
  });
}

