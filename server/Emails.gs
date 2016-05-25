function doGet(e) {
  if(e.parameter.to == 'dud@desktab.me'){
    return ContentService.createTextOutput('');
  }
  else if(e.parameter.authorize == 'authorize'){
    return sendEmail(e);
  }
  if(e.parameter.list == '0'){
    return retrieveAnEmail(e);
  }
  else if(e.parameter.list == '1'){
    return retrieveEmails(e);
  }
  return ContentService.createTextOutput(e.parameter.authorize);
}

function doPost(e){
  // For deleting and marking message as read
  if(e.parameter.action == 'read'){
    return markRead(e);
  }
  else if(e.parameter.action == 'delete');{
    return deleteEmail(e);
  }
}

function sendEmail(e){
  // Email takes in to, subject, and a message
  GmailApp.sendEmail(e.parameter.to, e.parameter.subject, e.parameter.message);
  return ContentService.createTextOutput(JSON.stringify('Email Sent'));
}

function retrieveAnEmail(e){
  
  var email_wanted = e.parameter.index;
  var threads = GmailApp.getInboxThreads();
  var message = threads[email_wanted].getMessages()[0];
  var from = message.getFrom();
  var date = message.getDate();
  var subject = message.getSubject();
  // An object containing information of the message
  var email = {
    "from" : from,
    "date" : date,
    "subject" : subject,
    "message" : message.getBody()
  }
  markRead(e);
  return ContentService.createTextOutput(JSON.stringify(email)).setMimeType(ContentService.MimeType.JSON);
  
  //return ContentService.createTextOutput(JSON.stringify('hello'));
}

function retrieveEmails(e) {
  var all_emails = [];
  // Looks at only the Priority Inbox of gmail
  var threads = GmailApp.getInboxThreads();
  var amount_threads = threads.length;
  var amount_user_wants = e.parameter.index;
  var size = 0;
  if(amount_threads <= amount_user_wants){
    size = amount_threads;
  }
  else{
    size = amount_user_wants;
  }
  //size = 5;
  var next_5 = parseInt(size, 10) + 5;
  // Takes amount of threads given
  for(var i = size; i < next_5; i++){
    // Get the first message in the first thread of your inbox
    var message = threads[i].getMessages()[0];
    var from = message.getFrom();
    var date = message.getDate();
    var subject = message.getSubject();
    // An object containing information of the message
    var email = {
      "from" : from,
      "date" : date,
      "subject" : subject
      //"message" : message.getBody()
    }
    all_emails.push(email);
  }
  // Allows the script to send objects back
  return ContentService.createTextOutput(JSON.stringify(all_emails)).setMimeType(ContentService.MimeType.JSON);
}


function markRead(e){
  var email_read = e.parameter.index;
  var threads = GmailApp.getInboxThreads();
  GmailApp.markThreadRead(threads[email_read]);
  return ContentService.createTextOutput(JSON.stringify('Email Read'));
}

function deleteEmail(e){
  var email_deleted = e.parameter.index;
  var threads = GmailApp.getInboxThreads();
  GmailApp.moveThreadToTrash(threads[email_deleted]);
  return ContentService.createTextOutput(JSON.stringify('Email Deleted'));
}