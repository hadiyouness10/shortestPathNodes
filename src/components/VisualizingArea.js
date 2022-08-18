import { forwardRef, React, useImperativeHandle } from 'react';
import { useEffect, useState, useRef } from 'react';
import Graph from '../functions/djikstra';
import { Stage, Layer, Text, Line, Circle, Group, Arrow } from 'react-konva';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

const VisualizingArea = forwardRef((props, ref) => {
    useImperativeHandle(ref, () => ({
        changeSpeed(e) {
            const currentSpeed = e.target.value;
            if (!isNaN(currentSpeed)) {
                setSpeed(parseInt(currentSpeed));
            }
        },
        setEndingNode(node, currentCircles) {
            if (currentCircles === null) currentCircles = circles;
            setCircles(currentCircles.map((circle) => {
                return {
                    ...circle,
                    stroke: circle.name === node ? 'blue' : circle.stroke === 'blue' ? 'black': circle.stroke 
                }
            }));
            setEndingNode(node);
        },
        setStartingNode(node, currentCircles) {
            if (currentCircles === null) currentCircles = circles;
            setCircles(currentCircles.map((circle) => {
                return {
                    ...circle,
                    stroke: circle.name === node ? 'green' : circle.stroke === 'green' ? 'black' :circle.stroke
                }
            }));
            setStartingNode(node);
        },
        generate(line, circle) {
            setLines([]);
            setCircles([]);
            console.log(circle);
                for (var i = 0; i < line.length; i++) {
                    var starting_circle = line[i]['start'];
                    var ending_circle = line[i]['end'];
                    var line_points = [];
                    for (var j = 0; j < circle.length; j++) {
                        if (circle[j]['name'] === starting_circle) {
                            var line_points_x = line[i]['points_x'];
                            var line_points_y = line[i]['points_y'];
                            var y = circle[j]['x'];
                            var x = circle[j]['y'];
                            line_points.push(0);
                            line_points.push(0);
                            for (var k = 0; k < line_points_x.length; k++) {
                                line_points.push(line_points_y[k] - y)
                                line_points.push(line_points_x[k] - x)
                            }
                        }
                        circle[j]['color'] = 'skyblue';
                        circle[j]['stroke'] = 'black';
                    }
              
                    for (k = 0; k < circle.length; k++) {
                        if (circle[k]['name'] === ending_circle) {
                            line_points.push(circle[k]['x'] - y);
                            line_points.push(circle[k]['y'] - x);
                            break;
                        }
                    }
                    line[i]['points'] = line_points;
                    line[i]['x'] = y;
                    line[i]['y'] = x;
                    line[i]['id'] = line_id(starting_circle, ending_circle);
                    line[i]['color'] = 'black';
                    line[i]['weight'] = 1;
                    line[i]['arrow'] = [
                        [line_points_y[parseInt(line_points_y.length / 2) - 1], line_points_x[parseInt(line_points_x.length / 2) - 1], line_points_y[parseInt(line_points_y.length / 2)], line_points_x[parseInt(line_points_x.length / 2)]],
                        [line_points_y[parseInt(line_points_y.length / 2) + 1], line_points_x[parseInt(line_points_x.length / 2) + 1], line_points_y[parseInt(line_points_y.length / 2)], line_points_x[parseInt(line_points_x.length / 2)]]
                    ];
                    line[i]['reversed'] = 0;
                }
            var nodes = setCurrentNodes(circle);
            setLines(line);
            setCircles(circle);
            this.setStartingNode(startingNode, circle);
            this.setEndingNode(endingNode, circle)
            return nodes;
        },
        async start() {
            this.clearPaths();
            setFound(true);
            let g = new Graph();
            for (var i = 0; i < circles.length; i++) {
                g.addVertex(circles[i].name);
            }
    
            for (i = 0; i < lines.length; i++) {
                g.addEdge(lines[i].start, lines[i].end, lines[i].weight);
            }
            var i = 0;
            // run dijkstra's algorithm, with A as the source vertex.
            let { parents, distances, steps, path } = g.dijkstra(startingNode, endingNode);
            console.log(distances);
            let currentSteps = "";
            for (i = 0; i < steps.length; i++) {
                currentSteps += steps[i].logs + '\n'
                setCurrentSteps((currentSteps));
                let currentCircles = circles;
                if (steps[i].neighbors !== undefined)
                    for (var j = 0; j < steps[i].neighbors.length; j++) {
                        currentCircles = currentCircles.map((circle) => {
                            return {
                                ...circle,
                                color: circle.name === steps[i].neighbors[j] ? 'red' : circle.color
                            }
                        });
                    }
                currentCircles = currentCircles.map((circle) => {
                    return {
                        ...circle,
                        color: circle.name === steps[i].circle ? 'blue' : circle.color
                    }
                });
                let currentLines = lines;
                if (steps[i].lines !== undefined)
                    for (j = 0; j < steps[i].lines.length; j++) {
                        currentLines = currentLines.map((line) => {
                            return {
                                ...line,
                                color: line.id === steps[i].lines[j] ? 'red' : line.color
                            }
                        });
                    }
                setLines(currentLines);
                setCircles(currentCircles);
                await sleep(speed * 1000);
            }
            let currentCircles = circles
            let final_path = "";
            for (var node in path) {
                currentCircles = currentCircles.map((circle) => {
                    return {
                        ...circle,
                        color: circle.name === path[node] ? 'red' : circle.color
                    }
                });
                if (path[node] != null)
                    final_path += path[node] + "->"
            }
            let currentLines = lines;
            for (i = 0; i < path.length - 1; i++) {
                currentLines = currentLines.map((line) => {
                    return {
                        ...line,
                        color: line.id === line_id(path[i], path[i + 1]) ? 'red' : line.color
                    }
                });
            }
            if (final_path.length === 0) setFound(false);
            setLines(currentLines);
            setCircles(currentCircles);
            setPath(final_path);
            setDistances(distances);
        },
        clearPaths() {
            setLines(lines.map((line) => {
                return {
                    ...line,
                    color: 'black'
                }
            }));
            setCircles(circles.map((circle) => {
                return {
                    ...circle, 
                    color: 'skyblue'
                }
            }));
            // setFound(false);
            setCurrentSteps('');
            setPath('');
            setDistances('');
        },
        return :{
            nodes:nodes
        }
    }))
    const [nodes, setNodes] = useState([]);
    const [currentSteps, setCurrentSteps] = useState('');
    const [finalPath, setPath] = useState('');
    const [distances, setDistances] = useState('');
    const [newTextObj, setNewTextObj] = useState('');
    const [speed, setSpeed] = useState(1);
    const [lines, setLines] = useState([]);
    const [circles, setCircles] = useState([]);
    const [startingNode, setStartingNode] = useState('');
    const [endingNode, setEndingNode] = useState('');
    const [found, setFound] = useState(true);

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    const line_id = (start, end) => {
        return start < end ? start + "_" + end : end + "_" + start;
    }

    function setCurrentNodes(circles) {
        var currentNodes = [];
        // currentNodes = [];
        for (var i = 0; i < circles.length; i++) {
            currentNodes.push(circles[i]['name']);
        }
        setNodes(currentNodes);
        return currentNodes;
    }



    const reverseArrow = e => {
        setLines( 
            lines.map((line) => {
                return {
                    ...line,
                    reversed: line.id === e ? line.reversed === 0 ? 1 : 0 : line.reversed,
                    start: line.id === e ? line.end : line.start,
                    end: line.id === e ? line.start : line.end,
                };
            })
        );
    }



    const handleTextareaKeyDown = (e, id) => {
        if (e.keyCode === 13) {
            // newTextObj.textEditVisible = false;
            let textObj = {
                textEditVisible: false,
                textX: newTextObj.textX,
                textY: newTextObj.textY,
                textValue: newTextObj.textValue,
                name: newTextObj.name
            }
            setNewTextObj(textObj);
            if (!isNaN(e.target.value)) {
                setLines(
                    lines.map((line) => {
                        return {
                            ...line,
                            weight: line.id === newTextObj.name ? parseInt(e.target.value) : line.weight
                        }
                    })
                );

            }
        }
    };



    const handleTextEdit = e => {
        let textObj = {
            textEditVisible: true,
            textX: newTextObj.textX,
            textY: newTextObj.textY,
            textValue: e.target.value,
            name: newTextObj.name,
        }
        setNewTextObj(textObj);
    };


    const handleTextDbClick = (e, id) => {
        const absPos = e.target.getAbsolutePosition();
        let current_value = 0;
        lines.map((line) => {
            if (line.id === id) {
                current_value = line.weight
            }
            return {};
        })
        let textObj = {
            textEditVisible: true,
            textX: absPos.x,
            textY: absPos.y,
            textValue: current_value,
            name: id,
        };
        setNewTextObj(textObj);
    }


    
    return (
        <div key={'mainContainer'}>

            <Row className='row'>
                <Col lg={8}>
                    <Stage className='stage' key={'stage'} width={950} height={600} style={stageStyle}>
                        <Layer key={'layer'}>
                            {lines.map((line) => (
                                <Group key={line.name}>
                                    <Line
                                        id={line_id(line.start, line.end)}
                                        name="one"
                                        key={line.name}
                                        x={line.x}
                                        y={line.y}
                                        points={line.points}
                                        tension={0.5}
                                        stroke={line.color}
                                    />
                                    <Text text={line.weight} key={line.name}
                                        y={line.points_x[parseInt(line.points_x.length / 2)] + 15}
                                        x={line.points_y[parseInt(line.points_y.length / 2)] + 15}
                                        fontSize={20}
                                        onDblClick={e => handleTextDbClick(e, line_id(line.start, line.end))}
                                    />
                                    <Arrow
                                        points={line.arrow[line.reversed]}
                                        pointerLength={20}
                                        pointerWidth={20}
                                        fill={'Black'}
                                        stroke={'Black'}
                                        strokeWidth={0}
                                        onClick={(e) => reverseArrow(line_id(line.start, line.end))}
                                        id={line_id(line.start, line.end)}
                                    />
                                </Group>
                            ))}
                            {circles.map((circle) => (
                                <Group key={circle.name}>
                                    <Circle
                                        key={circle.name}
                                        id={circle.id}
                                        x={circle.x}
                                        y={circle.y}
                                        radius={circle.radius}
                                        fill={circle.color}
                                        stroke={circle.stroke}
                                        strokeWidth={2}
                                    />
                                    <Text text={circle.name}
                                        key={circle.id}
                                        x={circle.x - circle.radius / 6}
                                        y={circle.y - circle.radius / 5}
                                        fontSize={circle.radius / 2}
                                    />
                                </Group>
                            ))}
                        </Layer>
                    </Stage>
                    <textarea
                        rows={1}
                        cols={1}
                        value={newTextObj.textValue}
                        name={newTextObj.name}
                        style={{
                            display: newTextObj.textEditVisible ? "block" : "none",
                            position: "absolute",
                            top: newTextObj.textY + "px",
                            left: newTextObj.textX + "px",
                            borderRadius: 5,
                        }}
                        onChange={e => handleTextEdit(e)}
                        onKeyDown={e => handleTextareaKeyDown(e)}
                    />
                </Col>
                <Col lg={4}>
                    <h4>Current Steps</h4>
                    <div >{currentSteps.split(/\n/).map(line => line.startsWith('\t') ? line.startsWith('\t\t') ? <p>&emsp;&emsp;{line}</p> : <p>&emsp;{line}</p> : <p>{line}</p>)}</div>
                    {found && finalPath.length > 0 ? (<div><h5>Path is: {finalPath.substring(0, finalPath.length - 2)}</h5><h6>The distance is: {distances[endingNode]}</h6></div>) : ('')}
                    {!found ? (<div><h5>Final Path not found</h5></div>) : ''}
                </Col>
            </Row>
        </div>
    );
});

export default VisualizingArea;


const stageStyle = {
    transition: '0.3s',
    boxShadow: '0 20px 16px 0 rgba(0,0,0,0.2)',
  }