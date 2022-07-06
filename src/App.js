import logo from './logo.svg';  
import './App.css';  
import {Input} from './components/Input/Input'
import React, { useState, useEffect } from 'react';
import { Dropdown, Selection } from 'react-dropdown-now';
import 'react-dropdown-now/style.css';
import * as jsReport from 'jsreport-browser-client-dist';
  
function App() {  
  const [username, userInput] = useInput({ type: "text", placeholder: "Username" });
  const [value, setValue] = useState(0);
  const [calculation, setCalculation] = useState(0);
  const [excelFile, setExcelFile] = useState(null);
  const [excelFileError, setExcelFileError] = useState(null); 
  const [excelData, setExcelData] = useState(null);
  const [dropValue, setDropValue] = useState(null);

  const customersList = {
    "parama": "G.Paramashivam<br>53, Ram Nagar<br>villapuram<br>Madurai-625013.",
    "தமிழ்": "தமிழ்<br>81, AKM Main Road<br>Thirupallai<br>Madurai-625021.",
  }
  // useEffect(() => {
  //   alert("20");
  //   setCalculation(() => count * 2);
  //   // setCount(()=> count * 5);
  // }, [value]); // <- add the count variable here

  function useInput({ type, placeholder /*...*/ }) {
    const [value, setValue] = useState("");
    const input = <input value={value} placeholder={placeholder} onChange={e => setValue(e.target.value)} type={type} />;
    return [value, input];
  }
 

  const fileType=['text/csv'];
  const handleFile = (e)=>{
    let selectedFile = e.target.files[0];

    if(selectedFile){
      console.log(selectedFile);
      if(selectedFile&&fileType.includes(selectedFile.type)){
        let reader = new FileReader();
        reader.readAsText(selectedFile);
    
        reader.onload=(e)=>{
          let csv = e.target.result;
          console.log("csv", csv)
          const array = csv.toString().split("\n");
          console.log("csv1", array)
          setExcelFileError(null);
          setExcelFile(array);
        } 
      }
      else{
        setExcelFileError('Please select only excel file types');
        setExcelFile(null);
      }
    }
    else{
      console.log('plz select your file');
    }
  }

  const handleSubmit=(e)=>{
    e.preventDefault();
    console.log("drop", dropValue)
    if(excelFile !== null && dropValue.value !== null){
      if(dropValue.value === "Bills"){
        console.log("excelFile", excelFile)
        let headers = excelFile[0].split(",");
        let tableContent = excelFile.slice(1, excelFile.length-1);
        console.log("values", headers, tableContent)
        let netRate = tableContent.slice(tableContent.length-1, tableContent.length)
        let productList = [];
        tableContent.slice(0, tableContent.length-1).forEach(element => {
          let main = {};
          let val = {};
          let content = element.split(",").map(str => Number(str))
            headers.forEach((ele,ind)=>{
                val[ele] = content[ind];
            });
            console.log("productVal", val, content)
            main.netRate = netRate.join().split(",");
            main['productList'] = val;
            let addressKey = element.split(",")[0]
            console.log("addressKey", addressKey)
            main['address'] = customersList[addressKey];
            productList.push(JSON.parse(JSON.stringify(main)));
        });
        console.log("MainList", productList)
        // console.log("data", data)
        // setExcelData(data);
        productList.forEach((data)=>{
          report(data,dropValue.value);
        })
      } else if (dropValue.value === "Slip"){
        console.log("excel", excelFile)
        let milkList = excelFile[0].split(",");
        let shopList = excelFile.slice(1, excelFile.length-2);
        let netRate  = excelFile.slice(excelFile.length-2, excelFile.length-1).join().split(",");
        // let netRate = net.split(",")
        console.log("values", milkList, shopList, netRate)
        let stList = [];
        shopList.forEach(element => {
            let list = element.split(",");
            let cal = {}
            let total = 0;
            cal.name = list[0];
            cal.balance = list[1];
            list.forEach((val,index)=>{
              console.log("valaaaaa", val !== '', index)
              if(val !== '' && val !== '\r' && index !== 0 && index !== 1 ){
                if(val.includes("/")){
                  let a = val.split("/")
                  total += parseInt(val) * parseInt(a[1]);
                } else {
                  total += parseInt(val) * parseInt(netRate[index]);
                console.log("total", total, val, netRate, index, netRate[index]);
                }
              }
            });
            cal.todayTotal = total;
            stList.push(cal);
        });
        console.log("MainList", stList);
        report({"shopList":stList}, dropValue.value);
      } else {
        console.log("Aavin Slip")
      }
    } 
    else{
      setExcelData(null);
    }
  }

  const report=(e, str)=>{
    // download the output to the file
    // jsReport.serverUrl = 'http://localhost:5488/Bills';
    var reportTitleText = "bills"
    let name = '';
    if(str === 'Bills'){
      name = '/Bills/bill'
    } else if (str === 'Slip') {
      name = '/slip/slip'
    }
    const request = {
      template: {
        name: name,
        engine: 'handlebars',
        recipe: 'chrome-pdf'
      },
      data: e
    };
    // jsReport.download('myreport.pdf')
    jsReport.headers['Authorization'] = "Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==";
    jsReport.serverUrl = 'http://localhost:5488';
    jsReport.renderAsync(request).then(function(res) {
      console.log("resssss", res)
      var html = '<html>' +
          '<head><style>html,body {padding:0;margin:0;} iframe {width:100%;height:100%;border:0}</style>' +
          '<title>'+reportTitleText+'</title></head>' +
          '<body>' +                                
          '<iframe type="application/pdf" src="' +  res.toObjectURL() + '"></iframe>' +
          '</body></html>';
      var a = window.open("about:blank", "_blank")
      a.document.write(html)
      a.document.close()
    });
  }

  return (
    <>
      {/* <Input placeholder="Username"></Input>
      <Input placeholder="Password"></Input> */}
      <input type='file' className='form-control'
          onChange={handleFile} required></input>
                <button onClick={handleSubmit} className='btn btn-success'
          style={{marginTop:5+'px'}}>Submit</button>

      <Dropdown
        placeholder="Select an option"
        options={['Bills', 'Slip', 'Aavin Slip']}
        value="one"
        onChange={(value) => setDropValue(value)}
        onSelect={(value) => console.log('selected!', value)} // always fires once a selection happens even if there is no change
        onClose={(closedBySelection) => console.log('closedBySelection?:', closedBySelection)}
        onOpen={() => console.log('open!')}
      />
    </>
  );
}  
  
export default App;