import ComingSoon from "./ComingSoon";
import Nav from "./Nav";

const Interview = ()=>{
    return(
        <div className="min-h-screen bg-black">
            <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-green-900">
                <Nav />
            </div>
            <div className="pt-20">
                <ComingSoon />
            </div>
        </div>
    );
}

export default Interview;