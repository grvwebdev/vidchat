import React from 'react';
import { Container, Navbar } from 'react-bootstrap';
const Topnav = () => {
    return  (<>
        <Navbar bg="dark" variant="dark" className='mb-5'>
            <Container>
                <span className='text-white text-left'>
                WebRTC Audio Video Chat App
                </span>
                <span className='text-white text-right'>
                Created by Gourav Bassi
                </span>
            </Container>
        </Navbar></>)
}

export default Topnav;