const {google} = require ('googleapis')
const keys = require('./keys.json')

const client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ['https://www.googleapis.com/auth/spreadsheets'] //acess release
);

client.authorize( function(err, tokens){  //For we can acess
    
    if(err){
        console.log(err);
        return;
    }else {
        console.log('Connection successful');
        gsrun(client);
    }
});


let eSoftware = new Array(24);

async function gsrun(cl){

    

    const gsapi = google.sheets({version:'v4', auth: cl });

    let sheetId = '1mn2H5_zj8xG8LikuAWh9E05ciEsUKHl7W2B0Hci9bGc'
    
    // get data from faults
    const faults = {     
        spreadsheetId: sheetId,
        range: 'engenharia_de_software!C4:C27'
      };
      let ft = await gsapi.spreadsheets.values.get(faults);
    
      //get data from P1
      const n1 = {   
        spreadsheetId: sheetId,
        range: 'engenharia_de_software!D4:D27'
      };
      let grade1 = await gsapi.spreadsheets.values.get(n1);

      //get data from P2
      const n2 = {    
        spreadsheetId: sheetId,
        range: 'engenharia_de_software!E4:E27'
      };
      let grade2 = await gsapi.spreadsheets.values.get(n2);

      //get data from P3
      const n3 = {    
        spreadsheetId: sheetId,
        range: 'engenharia_de_software!F4:F27'
      };
      let grade3 = await gsapi.spreadsheets.values.get(n3);
    
      
      //Array with all data from sheet, starting on first position
    for(n=0; n<24; n++)
      {
        eSoftware[n] =
          {
            ft: parseInt(ft.data.values[n][0]),
            n1: parseInt(grade1.data.values[n][0]),
            n2: parseInt(grade2.data.values[n][0]),
            n3: parseInt(grade3.data.values[n][0]),
            average: 0,
            situation: '',
            finalExam: 0
          }
      }
    
      averageCalc();
      studentSituation();
      updated();
       
      console.log(eSoftware);
      console.log(NewData); 

    //make final exam
    function averageCalc() { 
        eSoftware.forEach( s => {
        s.average = Math.ceil((s.n1 + s.n2 + s.n3) / 3);
        if(s.average>=50 & s.average<70){
          s.finalExam = 100 - s.average;
        } else {
            s.finalExam = '0';
        }
      }) 
    }
    
    //student status
    
    function studentSituation() {   
      for(n=0; n<24; n++)
        if(eSoftware[n].ft>15) 
        {
            eSoftware[n].situation = 'Reprovado por falta';
            eSoftware[n].finalExam = '0';
        } else if(eSoftware[n].average>=70) 
        {
            eSoftware[n].situation = 'Aprovado por nota';
        } else if(eSoftware[n].average<70 & eSoftware[n].average>=50) 
        {
            eSoftware[n].situation = 'Exame final';
        } else {
            eSoftware[n].situation = 'Reprovado por nota'
        }
    }

    const insertData = { 
        //lines to input data
        spreadsheetId: sheetId,
        range: 'engenharia_de_software!G4:H27',
        valueInputOption: 'USER_ENTERED',
        resource: { 
          values: NewData
        }
      };
      let source = await gsapi.spreadsheets.values.update(insertData);
    
    }

    //update on the sheet

    let NewData = new Array(24);

    function updated(){      
      for(n=0; n<24; n++)
      {
        NewData[n] = [eSoftware[n].situation,
        eSoftware[n].finalExam];
      }
    }
