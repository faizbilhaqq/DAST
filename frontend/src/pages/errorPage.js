import "./errorPage.css"
import { AbsoluteCenter, Text } from '@chakra-ui/react'
import { CheckCircleIcon, CloseIcon } from '@chakra-ui/icons'
import { Center, Square, Circle } from '@chakra-ui/react'
import { Box, Flex } from "@chakra-ui/react"
import { Stack, HStack, VStack } from '@chakra-ui/react'
import { Button, ButtonGroup } from '@chakra-ui/react'
import { Link } from 'react-router-dom';



const ErrorPage = () => {
    return ( 
        <div className="container">


            <VStack >
          
         
          
          <CloseIcon mt={20}  boxSize={40}  color={"red"} />
          <Text color={"red"} as='b' fontSize='5xl'>Error</Text>
          <Text fontSize='5xl'>Please fill with the correct host</Text>
          {/* <Text fontSize='xl'>*Result will be sent via Email</Text> */}
          
          

          <Button mt={20}  bg={"#016DD9"} color={"white"} h={"50px"}  w="25%"><Link to="/"  >Home</Link></Button>


        
          



          
            </VStack>

   

            






        </div>
     );
}
 
export default ErrorPage;