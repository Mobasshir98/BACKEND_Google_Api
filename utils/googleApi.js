import { google } from "googleapis";

export const searchFile= async (token)=> {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    'access_token': token,
  });
  const service = google.drive({ version: "v3", auth:oauth2Client });
  // const files = [];
  try {
    const result = await service.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: "nextPageToken, files(id, name)",
      spaces: "drive",
    });
    // Array.prototype.push.apply(files, result.files);
    const data = result.data.files.map(function (file) {
      return {name:file.name,id:file.id,token}
    });
    return data
  } catch (err) {
    return err
  }
}

export const getSheets = async (token,id)=>{
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    'access_token':token,
  })
  const sheets = google.sheets({version: 'v4', auth:oauth2Client});
  try{
    const result = await sheets.spreadsheets.get({
      auth:oauth2Client,
      spreadsheetId: id,
    });
   
   const data = result.data.sheets.map((obj)=>{
      return {title:obj.properties.title,Count:obj.properties.gridProperties.columnCount}
    })
    
    return data
  }
  catch(err){
    return err
  }
}


