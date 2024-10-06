import { createContext, useState } from "react";
import run from "../config/gemini";



export const Context = createContext();

const ContextProvider = (props) => {

    const [input,setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompts,setPrevPrompts] = useState([]);
    const [showResult,setShowResult] = useState(false);
    const [loading,setLoading] = useState(false);
    const [resultData,setResultData] = useState("");
    

    

    const delayPara = (index,nextWord) => {
        setTimeout(function(){
            setResultData(prev=>prev+nextWord);
        },75*index)
    }

    const newChat = () => {
        setLoading(false)
        setShowResult(false)
    }

    

    const onSent = async (prompt) => {

        setResultData("")
        setLoading(true)
        setShowResult(true)
        let response;
        if(prompt !== undefined){
            response = await run(prompt);
            setRecentPrompt(prompt)
        }
        else
        {
            setPrevPrompts(prev=>[...prev,input])
            setRecentPrompt(input)
            response = await run(input)
        }
        
        // Handle bold text, code blocks, hyperlinks, and line breaks in the response
        let newResponse = response
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')      // Bold text
            .replace(/```([^```]+)```/g, (_, code) => `<div class="code-block"><pre><code>${code}</code></pre><button class="copy-btn" onclick="navigator.clipboard.writeText('${code}')">Copy</button></div>`) // Code blocks with copy button
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>') // Hyperlinks
            .replace(/\n/g, '<br>');                      // Line breaks
        

        let newResponseArray = newResponse.split(" ");
        for(let i=0; i < newResponseArray.length;i++)
        {
            const nextWord = newResponseArray[i];
            delayPara(i,nextWord+" ")
        }
        
        setLoading(false)
        setInput("")
    }

    

    const contextValue = {
        prevPrompts,
        setPrevPrompts,
        onSent,
        setRecentPrompt,
        recentPrompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        newChat
    }

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    )

}

export default ContextProvider