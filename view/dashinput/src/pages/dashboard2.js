import "./dashboard2.css"
import telkomHQ2 from "../assets/telkomHQ2.jpg"
import { Text } from '@chakra-ui/react'
import { Input } from '@chakra-ui/react'
import { Textarea } from '@chakra-ui/react'
import { Button, ButtonGroup } from '@chakra-ui/react'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'



const Dash2 = () => {
    return ( 
        <div className="content2">
            <div className="box2">
                <div className="form2">
                <Text fontSize='4xl' as='b' >Scan Here!</Text>
                <br />
                <Text fontSize='l'  >Put your Email and JSON file here to Scan</Text>

                    <form action="">

                    <div className="textLabel2">
                    <Text as='b' fontSize='sm'  >Email</Text>
                    <Input  type="email" placeholder='Enter Your Email Address' value={email} onChange={(e) => setEmail(e.target.value)}  />
                    </div>

                    <div className="textLabel2">
                    <Text as='b' fontSize='sm'  >
                        JSON
                    </Text>
                    <input type="file" accept=".json" onChange={handleFileChange}  placeholder='JSON' height={130} /> 
                    
                    


                    </div>

                    <Button  onClick={handleSubmit} className="button2" bg='black'  _hover={{ bg: '#999999' }} color="white" size='md'>
                    Submit
                    </Button>


                    </form>
                </div>

                <div className="sidePicture">
                    <img src={telkomHQ2} alt="" />

                </div>
            </div>
        </div>
     );
}
 
export default Dash2;
