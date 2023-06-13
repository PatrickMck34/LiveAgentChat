
import React, {useRef, useState, useEffect} from 'react';
import socketIOClient from "socket.io-client"
import Alert from 'react-bootstrap/Alert'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ListGroup from 'react-bootstrap/ListGroup'
import Badge from 'react-bootstrap/Badge'
import FormControl from 'react-bootstrap/FormControl'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'

const ENDPOINT = 
window.location.host.indexOf("localhost") >= 0
? "http://127.0.0.1:4000"
: window.location.host

export default function UserChat() {
    const [selectedUser, setSelectedUser] = useState({})
    const [socket, setSocket] = useState(null)
    const uiMessagesRef = useRef(null)
    const [messageBody, setMessageBody] = useState("")
    const [messages, setMessages] = useState([])
    const [users, setUsers] = useState([])
    const [userName, setUserName] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    
    useEffect(() => {
        
        if(uiMessagesRef.current) {
            uiMessagesRef.current.scrollBy({
                top: uiMessagesRef.current.scrollHeight,
                left: 0,
                behavior: "smooth",
            })
        }
        if(socket) {
            socket.on("message", (data) => {
                if(selectedUser.name === data.from) {
                    setMessages([...messages, data])
                    
                    
                } else {
                    const existUser = users.find((user) => user.name === data.from)
                    if(existUser) {
                        setUsers(
                            users.map((user) => 
                            user.name === existUser.name ? {...user, unread: true} : user)
                            )
                        }
                    }
                })
                socket.on("updateUser", (updatedUser) => {
                    const existUser = users.find((user) => user.name === updatedUser.name)
                    if(existUser) {
                        setUsers(
                            users.map((user) => user.name === existUser.name ? updatedUser : user)
                            )
                            
                            
                        } else {
                            setUsers([ ...users, updatedUser])
                        }
                    } )
                    socket.on("listUsers", (updatedUsers) => {
                        setUsers(updatedUsers)
                    })
                    socket.on("selectUser", (user) => {
                        setMessages(user.messages)
                    })
                }
                else {
                    const sk = socketIOClient(ENDPOINT)
                    setSocket(sk);
                    sk.emit("onLogin", {
                        name: userName,
                    })
                }
            }, [messages, selectedUser, socket, users, userName])
            const supportHandler = () => {
                setIsOpen(true);
                if(!userName) {
                    setUserName(prompt("Please enter a name"))
                }
                const sk = socketIOClient(ENDPOINT)
                setSocket(sk)
            }
            
            const selectUser = (user) => {
                setSelectedUser(user)
                const existUser = users.find((x) => x.name === user.name)
                if(existUser) {
                    setUsers(
                        users.map((x) => 
                        x.name === existUser.name ? { ...x, unread: false} : x)
            )
        }
        socket.emit("onUserSelected", user)
    }
    const submitHandler = (e) => {
        e.preventDefault()
        if(!messageBody.trim()) {
            alert("Error, please type message")
        } else {
            setMessages([
                ...messages,
                {body: messageBody, 
                    from: userName, 
                    to: selectedUser.name},
            ])
            setTimeout(() => {
                socket.emit("onMessage", {
                    body: messageBody, 
                    from: userName,
                    to: selectedUser.name,
                })
            }, 1000)
            setMessageBody("")
        }
    }
    return (
        <div>

        {!isOpen ? (
            <Button variant="primary" onClick={supportHandler}> Chat</Button>
            ):(
                <Row>
        <Col sm={3}>
            {users.filter((x) => x.name !== userName).length === 0 && (
                <Alert variant="info">No user found</Alert>
                )}
            <ListGroup>
                {users
                .filter((x) => x.name !== userName)
                .map((user) => (
                    <ListGroup.Item
                    action
                    key={user.name}
                    variant={user.name === selectedUser.name ? "info" : ""}
                    onClick={() => selectUser(user)}
                    >
                    <Badge
                    bg={
                        selectedUser.name === user.name
                        ? user.online
                        ? "primary"
                        : "secondary"
                        : user.unread
                        ? "danger"
                        : user.online
                        ? "primary"
                        : "secondary"
                    }
                    >
                            {selectedUser.name === user.name
                            ? user.online
                            ? "Online"
                            : "Offline"
                            : user.unread
                            ? "New"
                            : user.online
                            ? "Online"
                            : "Offline" }
                    

                        </Badge>
                   &nbsp;
                    {user.name}

                </ListGroup.Item>
                ))}
                </ListGroup>

              
        
        </Col>
        <Col sm={9}>
            <div className="Admin">
                {!selectedUser.name ? (
                    <Alert variant="info"> Select a user to start a chat</Alert>
                    ) : (
                        <div>
                        <h2> Chat With {selectedUser.name}</h2>
                        <ListGroup ref={uiMessagesRef}>
                            {!messages.length === 0 && (
                                <ListGroup.Item>No Message</ListGroup.Item>
                                )}
                            {messages.map((msg, index) => (
                                <ListGroup.Item key={index}>
                                <strong>{`${msg.from}: `}</strong> {msg.body}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                        <div>
                            <form onSubmit={submitHandler}>
                            <InputGroup className="col-6">
                                    <FormControl
                                    value={messageBody}
                                    onChange={(e) => setMessageBody(e.target.value)}
                                    type="text"
                                    placeholder="type message">
                                    </FormControl>
                                    <Button type="submit" variant="primary">
                                        Send
                                    </Button>
                                </InputGroup>
                            </form>
                        </div>
                        </div>
                )
            }

            </div>
        
        </Col>
      </Row>
            )}
        </div>
        
        )
}

