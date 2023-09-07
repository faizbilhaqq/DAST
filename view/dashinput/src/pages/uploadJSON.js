import "./uploadJSON.css"
import { Text } from '@chakra-ui/react'
import { CheckCircleIcon } from '@chakra-ui/icons'

const Upload = () => {
    return ( 
        <div className="container">
            <div className="square">
            <Text fontSize='4xl'>Success!!</Text>

            <CheckCircleIcon boxSize={20} ml={20} mt={9}  />

            <Text  mt={30} ml="auto" mr="auto" fontSize='xl'>JSON file uploaded and processed succesfully</Text>


            </div>
        </div>
     );
}
 
export default Upload;