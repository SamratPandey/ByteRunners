import { Editor } from "@monaco-editor/react";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  } from "@/components/ui/resizable"
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";




const languageMap = {
    "C++": "cpp",
    Java: "java",
    Python: "python",
    JavaScript: "javascript",
};

const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on',
    readOnly: false,
};

const Solve = () =>{
    const [problem, setProblem] = useState({});
    const problemId = useParams().problemId;
    console.log(problemId);
    useEffect(() =>{
        const handelGetProblem = async() =>{
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/problem/${problemId}`,{
               headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
                })
            if(response){
                setProblem(response.data);
            }
        }
        handelGetProblem();
    },[])

    return(
        <div className="w-screen h-screen">
         <ResizablePanelGroup
            direction="horizontal"
            className="max-w-full md:min-w-[450px]"
            >
            <ResizablePanel className="">
                <div className="flex h-[200px] items-center justify-center p-6">
                </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50}>
                <Editor
                    height="100%"
                    theme="vs-dark"
                    options={editorOptions}
                    defaultLanguage="javascript"
                />
            </ResizablePanel>
            </ResizablePanelGroup>
                    

        </div>
    );
}
export default Solve;