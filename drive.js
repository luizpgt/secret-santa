/* FOLDERS must start exactly the same */
const PARTY_FOLDER = ""; // folder id 
const GIFTEE_FOLDER = ""; // folder id 

/* GET
 * get list of people who did not draw their giftee
 * 
 * people are represented as files in a google drive folder, 
 * (when a person draw their giftee, their file is deleted) <- deletion happens in POST func 
 */ 
function doGet() {
  try {
    var folder = DriveApp.getFolderById(PARTY_FOLDER);
    var files = folder.getFiles();
    var fileList = [];

    // collect
    while (files.hasNext()) {
      var file = files.next();
      fileList.push(file.getName());
    }
    
    // send
    var response = {
      status: "success",
      files: fileList
    };

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
      var errorResponse = {
        status: "error",
        message: error.toString()
      };
      return ContentService.createTextOutput(JSON.stringify(errorResponse))
        .setMimeType(ContentService.MimeType.JSON);
  }
}

/* POST
 * Basically a draw-the-giftee function. 
 *
 * The pool of giftees is a pool of files with the name of each person
 * A person who draw their giftee triggers the deletion of 2 files: 
 * - deletes their own file inside PARTY_FOLDER 
 * - deletes the giftee they drown from GIFTEE_FOLDER
 */
function doPost(e) {
  // prevent two people getting the same giftee at the same time:
  var lock = LockService.getScriptLock();
  lock.tryLock(7000); // 7s lock
  try {
    var member = e.postData.contents;

    // delete member from party files: 
    var folder = DriveApp.getFolderById(PARTY_FOLDER);
    var files = folder.getFilesByName(member);
    if (files.hasNext()) {
      var file = files.next();
      file.setTrashed(true);
    }

    // get possible giftees
    var folder = DriveApp.getFolderById(GIFTEE_FOLDER);
    var files = folder.getFiles();
    var fileList = [];

    // -- collect
    while (files.hasNext()) {
      var file = files.next();
      if (file.getName() != member) {
        fileList.push(file);
      }
    }

    // respond with giftee and remove it from the pool
    giftee = Math.floor(Math.random() * fileList.length);

    var response = {
      status: "success",
      giftee: (fileList[giftee]).getName(),
    };
    
    (fileList[giftee]).setTrashed(true); // set trash here!

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    var errorResponse = { status: "error", message: error.toString() };
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}