import Button from 'react-bootstrap/Button';
import React, { useState, useRef, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import  InputGroup  from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import socketIOClient from "socket.io-client"

const ENDPOINT = 
window.location.host.indexOf("localhost") >= 0
? "http://127.0.0.1:4000"
:window.location.host
const ChatBox = () => {
    const uiMessagesRef= useRef(null)
    const [userName, setUserName] = useState("")
    const [messages, setMessages] = useState([{ from: "System", body: "Hello There, please ask youre question."}])
    const [isOpen, setIsOpen] = useState(false)
    const [messageBody, setMessageBody] = useState('')
    const [socket, setSocket] = useState(null)

    useEffect(()=>{
        if(uiMessagesRef.current) {
            uiMessagesRef.current.scrollBy({
                top: uiMessagesRef.current.scrollHeight,
                left: 0, 
                behavior: "smooth"
            })
        }
        if(socket) {
            socket.emit("onLogin", { name: userName} )
            socket.on("message",(data) => {
                setMessages([...messages, data])
            })
        }

    }, [messages, socket, userName])
    const supportHandler = () => {
        setIsOpen(true);
        if(!userName) {
            setUserName(prompt("Please enter a name"))
        }
        const sk = socketIOClient(ENDPOINT)
        setSocket(sk)
    }
    const closeHandler = () => {
        setIsOpen(false)
    }
    const submitHandler = (e) => {
e.preventDefault()
if(!messageBody.trim()) {
    alert("Error, message empty")
} else {
    setMessages([
        ...messages,
        {body: messageBody, from: userName, to: "Admin"},
    ])
    setTimeout(() => {
        socket.emit("OnMessage" , {
            body: messageBody, 
            from: userName,
            to: "Admin",
        })
    }, 1000)
    setMessageBody("")

}
    }
    return (
        <div className="chatbox">
            {!isOpen ?(
            <Button variant="primary" onClick={supportHandler}> Chat</Button>
            ): (
                    <Card>
                        <Card.Body>
                            <Row>
                                <Col>
                                <strong>Support</strong>
                                </Col>
                                <Col className="text-end">
                                <Button className="btn-sm btn-secondary" type="button" onClick={closeHandler}>X</Button>
                                </Col>
                            </Row>
                            <hr />
                            <ListGroup ref={uiMessagesRef}>
                           {messages.map((msg, index) => (
                            <ListGroup.Item key={index}>
                                <strong>{`${msg.from}: `}</strong> {msg.body}
                            </ListGroup.Item>
                           )

                           )}
                            <form onSubmit={submitHandler}>
                                <InputGroup className="col-6">
                                    <FormControl
                                    value={messageBody}
                                    onChange={(e) => setMessageBody(e.target.value)}
                                    type="text"
                                    placeHolder="type message">
                                    </FormControl>
                                    <Button type="submit" variant="primary">
                                        Send
                                    </Button>
                                </InputGroup>
                            </form>
                            </ListGroup>
                        </Card.Body>
                    </Card>
            )}

        </div>
    )
} 
export default ChatBox