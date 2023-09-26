import "./uploadJSON.css"
import { AbsoluteCenter, Text } from '@chakra-ui/react'
import { CheckCircleIcon } from '@chakra-ui/icons'
import { Center, Square, Circle } from '@chakra-ui/react'
import { Box, Flex } from "@chakra-ui/react"
import { Stack, HStack, VStack } from '@chakra-ui/react'
import { Button, ButtonGroup } from '@chakra-ui/react'
import { Link } from 'react-router-dom';



const Upload = () => {
    return ( 
        <div className="container">


            <VStack >
          
         
          
          <CheckCircleIcon mt={20}  boxSize={40}  color={"green"} />
          <Text color={"green"} as='b' fontSize='5xl'>Succesfully</Text>
          <Text fontSize='5xl'>JSON file uploaded and processed</Text>
          <Text fontSize='xl'>*Result will be sent via Email</Text>

          

          <Button mt={20}  bg={"green"} color={"white"} h={"50px"}  w="25%"><Link to="/"  >Home</Link></Button>


        
          



          
            </VStack>

   

            






        </div>
     );
}
 
export default Upload;