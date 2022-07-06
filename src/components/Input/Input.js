import React, { useState, useEffect } from 'react';
import './Input.css'
export function Input({placeholder}) {  

    console.log("place", typeof placeholder)
  const [username, userInput] = useInput({ type: "text", placeholder });

  // useEffect(() => {
  //   alert("20");
  //   setCalculation(() => count * 2);
  //   // setCount(()=> count * 5);
  // }, [value]); // <- add the count variable here

  function useInput({ type, placeholder /*...*/ }) {
    // var [place] = 
    const [value, setValue] = useState("");
    const input = <input className='inputcomp' value={value} placeholder={placeholder} onChange={e => setValue(e.target.value)} type={type} />;
    console.log("vslaue", value)
    return [value, input];
  }

  return (
    <>
      {userInput}
    </>
  );
}  