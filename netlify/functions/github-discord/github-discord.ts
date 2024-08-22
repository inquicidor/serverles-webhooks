import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";


const notify = async(message:string)=>{

        
        const body = {content: message}

        const resp = await fetch(process.env.DISCORD_WEBHOOK_URL??'',{
            method:'POST',
            headers:{'Content-Type': 'application/json'},
            body:JSON.stringify(body),
        });

        if(!resp.ok){
            console.log(`error sending message to discord`);
            return false;
        }
        return true;
}



const onStar = (payload:any):string=>{
    let message:string ='';
    const {action, sender, repository, starred_at} = payload;
    message = `user ${sender.login} at ${starred_at}  ${action}, star on ${repository.full_name} `
    
    return message;
}

const onIssues = (payload:any):string=>{
    const {action, issue} = payload;

    if(action === 'opened'){
        return  `an issue was opened with this title ${issue.title}`
    }
    if(action === 'closed'){
        return `an issue was closed by ${issue.user.login}`
    }
    if(action === 'reopened'){
        return  `an issue was reopened by ${issue.user.login}`
    }

    return `unhandled action for the issue event ${action}`;
}


const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  
    const githubEvent = event.headers['x-github-event']?? 'unknown';
    const payload = JSON.parse(event.body ?? '{}');

    console.log(`${payload}`);

    let message:string;

    switch(githubEvent){
        case 'star':
            console.log(`${payload}`);
            message = onStar(payload);
            break;
            case 'issues':
            console.log(`${payload}`);
            message = onIssues(payload);    
        break;

        default:
            message = `unknown event ${githubEvent}`;
            
        }
    console.log(`${message}`);

  await notify(message);  

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'done',
    }),
    headers: {
      'Content-Type':'application/json'
    }
  }
};

export { handler };