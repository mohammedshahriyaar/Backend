
//how we handle using promies
const asyncHandler = (requestHandler)=>{

    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch( (err)=> next(err))
    }
}


export {asyncHandler}



// const asyncHandler =()=>{}
//similarly like chainging of filter and map
// const asyncHandler =(func)=>() =>{}
// const asyncHandler =(func)=> async ()=>{}

//the code below i in terms of trycatch
// const asyncHandler = (func) =>async (req,res,next)=>{
//     try {
//         await func(req,res,next)
        
//     } catch (error) {
//         res.status(err.code ||500).json(
//             {
//                 success:false,
//                 message:err.message
//             }
//         )
//     }
// }

// export {asyncHandler}
//basically we made a wrapper whoever calls that function then gives necessary function as argument then this handler will
//perform the async await for that function
//what this does i reduces no of async await codes we write for interaction

// const asyncHandler = ()