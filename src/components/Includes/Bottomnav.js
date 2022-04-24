import React from 'react';
import { Container, Navbar } from 'react-bootstrap';
import { BsCameraVideoFill, BsCameraVideoOffFill, BsFillMicFill, BsFillMicMuteFill, BsFillEmojiSmileFill, BsFillEmojiWinkFill } from "react-icons/bs";
const Bottomnav = (props) => {
    return  (<>
        <Navbar fixed="bottom"  bg="dark" variant="dark" >
            <Container className='text-white text-center'>
                <div className='col-md-4'>
                </div>
                <div className='col-md-4'>
                    <span className='p-3' role="button" title="Video" onClick={() => {
                        if(props.camOn && !props.micOn){
                            alert('Both mic and video cannot be turned off, leave one on');
                            return;
                        }
                        props.setcamOn(props.camOn?false:true);
                    }}>
                    {
                        props.camOn?(
                            <BsCameraVideoFill />
                        ):(
                            <BsCameraVideoOffFill/>
                        )
                    }
                    </span> <span className='p-3' role="button" title="Audio" onClick={() => {
                        if(!props.camOn && props.micOn){
                            alert('Both mic and video cannot be turned off, leave one on');
                            return;
                        }
                        props.setmicOn(props.micOn?false:true);
                    }}>
                    {
                        props.micOn?(
                            <BsFillMicFill />
                        ):(
                            <BsFillMicMuteFill/>
                        )
                    }
                    </span> <span className='p-3' role="button" title="Blur" onClick={() => {
                        props.setblurOff(props.blurOff?false:true);
                    }}>
                    {
                        props.blurOff?(
                            <BsFillEmojiSmileFill />
                        ):(
                            <BsFillEmojiWinkFill/>
                        )
                    }
                    </span>
                </div>
                <div className='col-md-4'>
                </div>
            </Container>
        </Navbar></>)
}

export default Bottomnav;