const S_IFDIR  = 0o040000;  // # directory
const S_IFCHR  = 0o020000;  // # character device
const S_IFBLK  = 0o060000;  // # block device
const S_IFREG  = 0o100000;  // # regular file
const S_IFIFO  = 0o010000;  // # fifo (named pipe)
const S_IFLNK  = 0o120000;  // # symbolic link
const S_IFSOCK = 0o140000;  // # socket file

const S_ISUID  = 0o0004000; //  # set UID bit
const S_ISGID  = 0o0002000; //  # set-group-ID bit
const S_ISVTX  = 0o0001000; //  # sticky bit

const S_IRUSR  = 0o00400; //    # owner has read permission
const S_IWUSR  = 0o00200; //   # owner has write permission
const S_IXUSR  = 0o00100; //   # owner has execute permission

const S_IRGRP  = 0o00040; //   # group has read permission
const S_IWGRP  = 0o00020; //   # group has write permission
const S_IXGRP  = 0o00010; //   # group has execute permission

const S_IROTH  = 0o00004; //   # others have read permission
const S_IWOTH  = 0o00002; //   # others have write permission
const S_IXOTH  = 0o00001; //   # others have execute permission

const S_IMODE = 0o07777; //   # mask for user adjustable mode bits

module.exports = (function() {
  return {
    ['REG_FILE'] : S_IFREG | S_IRUSR | S_IWUSR | S_IRGRP | S_IROTH,
    ['FOLDER'] : S_IFDIR | S_IRUSR | S_IWUSR | S_IWUSR | S_IXUSR | S_IRGRP | S_IXGRP | S_IROTH | S_IXOTH
  }
})();
// console.log( S_IFDIR | S_IRUSR | S_IWUSR | S_IWUSR | S_IXUSR | S_IRGRP | S_IXGRP | S_IROTH | S_IXOTH );
// console.log( S_IFREG | S_IRUSR | S_IWUSR | S_IRGRP | S_IROTH );
//
// console.log( 0o170777);
// console.log( 0o644 | S_IFREG );
// 0x0777  1911
// 16877

// 33188    // 100644
// -rw-r--r--
// https://www.rapidtables.com/convert/number/index.html
