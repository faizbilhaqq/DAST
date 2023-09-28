import "./dashboard.css";
import { Text } from '@chakra-ui/react';
import { Input } from '@chakra-ui/react';
import { Textarea } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import { useState } from 'react';
import telkomHQ2 from "../assets/telkomHQ2.jpg"
import { useNavigate } from 'react-router-dom';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'

const Dash = () => {
    const [email, setEmail] = useState('');
    const [Url, setUrl] = useState("");
    const [jsonData, setJsonData] = useState(null);
    const [isActive, setisActive] = useState(true);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            alert('Please enter your email.');
            return;
        }

        if (!jsonData && !Url) {
            alert('Please select a JSON file or enter URL');
            return;
        }



        // Prepare data to send to the server
        const formData = new FormData();
        formData.append('email', email);
        if (jsonData){
            
            formData.append('jsonFile', new Blob([JSON.stringify(jsonData)], { type: 'application/json' }));
        }

        if (Url){
            
            formData.append('URL', JSON.stringify(Url));
        }
        
        
        try {
            // Send a POST request to localhost:3001/upload-json
            const response = await fetch('http://localhost:3001/upload-json', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                navigate("/loading")
                await setTimeout(navigate('/uploadJSON'), 30000)
                

                
                // alert('JSON file and email sent successfully.');

                // Clear the form after successful submission
                setEmail('');
                setUrl('');
                setJsonData(null);



               





            } else {
                alert('Failed to send JSON file and email.');
                console.log(response);
            }
        } catch (error) {
            navigate("/errorPage")
            console.error('Error sending request:', error);
            alert('An error occurred while sending the request.');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setisActive(isActive => !isActive)
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsedData = JSON.parse(event.target.result);
                    setJsonData(parsedData);
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    alert('Invalid JSON file.');
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="content2">
            <div className="box2">
                <div className="form2">
                <Text fontSize='4xl' as='b' >Scan Here!</Text>
                <br />
                <Text mb={5} fontSize='l'  >Put your Email and JSON/URL here to Scan</Text>

                    <form action="">

                    {/* <div className="textLabel2">
                    <Text as='b' fontSize='sm'  >Email</Text>
                    <Input  type="email" placeholder='Enter Your Email Address' value={email} onChange={(e) => setEmail(e.target.value)}  />
                    </div>

                    <div >
                    <Text as='b' fontSize='sm'  >
                        JSON
                    </Text>
                    <br />
                    <input type="file" className={isActive ? "hidden": "notHidden"} accept=".json" onChange={handleFileChange}  placeholder='JSON' height={130} /> 
                    
                    


                    </div> */}

                    <Tabs isFitted variant='enclosed'>
                    <TabList mb='1em'>
                        <Tab _selected={{ color: 'white', bg: 'blue.300' }} >JSON</Tab>
                        <Tab _selected={{ color: 'white', bg: 'blue.300' }} >URL</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel pt={0} >
                    <div className="textLabel2">
                    <Text as='b' fontSize='sm'  >Email</Text>
                    <Input  type="email" placeholder='Enter Your Email Address' value={email} onChange={(e) => setEmail(e.target.value)}  />
                    </div>

                    <div >
                    <Text as='b' fontSize='sm'  >
                        JSON
                    </Text>
                    <br />
                    <input type="file" className={isActive ? "hidden": "notHidden"} accept=".json" onChange={handleFileChange}  placeholder='JSON' height={130} /> 
                    
                    


                    </div>
                        </TabPanel>

                        <TabPanel pt={0} >

                        <div className="textLabel2">
                        <Text as='b' fontSize='sm'  >Email</Text>
                        <Input  type="email" placeholder='Enter Your Email Address' value={email} onChange={(e) => setEmail(e.target.value)}  />
                        </div>

                        <div className="textLabel2">
                        <Text as='b' fontSize='sm'  >URL</Text>
                        <Input  type="text" placeholder='Enter URL' value={Url} onChange={(e) => setUrl(e.target.value)}  />
                        </div>                        

                        </TabPanel>


                    </TabPanels>
                    </Tabs>

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

export default Dash;
