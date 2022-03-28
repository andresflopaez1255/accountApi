



const messageBody =(data:unknown, message:string, status:boolean)=>{
	return {
		message: message,
		status: status,
		data: data,
	}
}

export default messageBody