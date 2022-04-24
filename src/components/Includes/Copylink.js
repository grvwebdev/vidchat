import React from 'react';
import { Form, Button, Row } from 'react-bootstrap';
const Copylink = (props) => {
    return  (<div>
        <Row>
        <div className="col-md-4"></div>
        <div className="col-md-3 mb-2">
            <Form.Control
                value={props.myid}
                id="linkText"
                readOnly
            />
        </div>
        <div className="col-md-1 text-center">
            <Button  variant="secondary"  onClick={props.copyLink} >Copy</Button>
        </div>
        
        </Row>
    </div>)
}

export default Copylink;