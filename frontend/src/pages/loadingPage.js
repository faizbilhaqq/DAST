import "./loadingPage.css"
import logo from "../assets/telkomlogo.png"
import { Text } from '@chakra-ui/react'

const Loading = () => {
    return ( 

        <div className="container2">
          

            {/* <img   src={logo} alt="" /> */}
            {/* <div className="content"> */}
            {/* <div className="loader"></div> */}
            <p className="emoji" >🕵️‍♂️</p>
            

            <Text  fontWeight={"bold"} fontSize='4xl'>Loading . . . </Text>
            
            <Text color={"#999999"} fontSize="3xl" > Scanning in Progress </Text>

            <div class="loader"></div>

            {/* </div> */}



        </div>


     );
}
 
export default Loading;