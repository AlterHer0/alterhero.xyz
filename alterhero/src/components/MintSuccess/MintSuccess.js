const MintSuccess = ({ setMintSuccess }) => {
    return (
   
     <div className="flex w-full h-[100vh] m-auto relative">
       <img className="flex w-full" src='/asset/MintSuccess.gif' alt="Back" />
       <div onClick={()=> {setMintSuccess(false)}}
       className="flex w-1/3 h-1/3 m-auto cursor-pointer absolute inset-0 z-40"></div>
       </div>
  
    )
  }
  
  export default MintSuccess
  