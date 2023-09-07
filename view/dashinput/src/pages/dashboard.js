import "./dashboard.css"
import { Text } from '@chakra-ui/react'
import { Input } from '@chakra-ui/react'
import { Radio, RadioGroup, Stack } from '@chakra-ui/react'
import { Select } from '@chakra-ui/react'
import { Textarea } from '@chakra-ui/react'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import {useState} from 'react';
import { Button, ButtonGroup } from '@chakra-ui/react'


const Dash = () => {



    const handleSubmit = (e) => {
        e.preventDefault();
       
    }



    return ( 
        <div className="content">
            <div className="box">
            <Text as='b' fontSize='2xl'  >Dynamic Tester 🕵️‍♀️ </Text>

            <form    >

            <div className="textLabel">
            <Text as='b' fontSize='lg'  >Email</Text>
            <Input type="email" placeholder='Enter Your Email Address' />
            </div>



            <div className="textLabel">
            <Text as='b' fontSize='lg'  >
                JSON
            </Text>
            <Tabs >
            <TabPanels>
                <TabPanel pr="0px" pl="0px" >
                <Textarea  placeholder='JSON' />       
                </TabPanel>
            </TabPanels>
            </Tabs>
            


            </div>


            <Button onClick={handleSubmit} className="submitButton" colorScheme='teal' size='md'>
                Submit
            </Button>

            {/* <button>submit</button> */}
              </form>

            </div>
        </div>
     );
}
 
export default Dash;