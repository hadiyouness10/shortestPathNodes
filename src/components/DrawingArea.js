import { React, useImperativeHandle } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { useEffect, useState, useRef } from 'react';
import { forwardRef } from 'react';

const DrawingArea = forwardRef((props, ref) => {
    useImperativeHandle(ref, () => ({
        clearDrawing() {
            setLines([]);
        },
        generate() {
            console.log(lines);
            var allLines = [];
            var circles = [];
            var circle_index = 1;
            for (var i = 0; i < lines.length; i++){
                // console.log(lines[i]['points']);
                let x1 = lines[i]['points'][1];
                let x2 = lines[i]['points'][lines[i]['points'].length - 1];
                let y1 = lines[i]['points'][0];
                let y2 = lines[i]['points'][lines[i]['points'].length - 2];

                let x3 = lines[i]['points'][lines[i]['points'].length / 2 ];
                let y3 = lines[i]['points'][lines[i]['points'].length / 2-1];

                if (lines[i]['points'].length/2 % 2 === 0) {
                    x3 = lines[i]['points'][lines[i]['points'].length / 2 -1];
                    y3 = lines[i]['points'][lines[i]['points'].length / 2-2];
                }
                let distance = findDistance(x1, y1, x2, y2);
                let par = findDistance(x1, y1, x3, y3);
                let radius = par / 2;
                let [y, x] = findCircle(x1, y1, x3, y3);
                if (distance < 50) {
                    //circle detected
                    // console.log('distance is: ' + distance)
                    // console.log(x1 + " " +y1 + " " + x3 + " " + y3)
                    // console.log(radius)
                    let circle = { 
                        name: circle_index+"",
                        x: x,
                        y: y,
                        radius: radius,
                        stroke: 'black',
                    }
                    if (x != undefined && y != undefined && radius > 20) {
                        circle_index++;
                        circles.push(circle);

                    }
                }
            }
            console.log(circles)

            for (i = 0; i < lines.length; i++){
                let x1 = lines[i]['points'][1];
                let x2 = lines[i]['points'][lines[i]['points'].length - 1];
                let y1 = lines[i]['points'][0];
                let y2 = lines[i]['points'][lines[i]['points'].length - 2];
                let distance = findDistance(x1, y1, x2, y2);
                let points_x = [];
                let points_y = [];
                let points = lines[i]['points'];
                if (points.length > 20) {
                    for (var k = 0; k < points.length - 1; k += 10) {
                        points_x.push(points[k + 1]);
                        points_y.push(points[k]);
                    }
                }
                else {
                    for (var k = 0; k < points.length - 1; k += 2) {
                        points_x.push(points[k + 1]);
                        points_y.push(points[k]);
                    }
                }
                if (distance > 50) {
                    let line = {
                        points_x: points_x,
                        points_y: points_y,
                    }
                    let index_checker = 0;
                    for (var j = 0; j < circles.length; j++){
                        let circle_x = circles[j]['y'];
                        let circle_y = circles[j]['x'];
                        console.log(circle_x + " "+  circle_y)
                        console.log(x1 + " " + y1)
                        console.log(circles)
                        let distance_line_circle = findDistance(circle_x, circle_y, x1, y1);
                        console.log(distance_line_circle + " " + circles[j]['radius'] )
                        if (distance_line_circle < circles[j]['radius'] * 2) {
                            line.start = circles[j]['name'];
                            index_checker++;
                        }
                    }
                    for (var j = 0; j < circles.length; j++){
                        let circle_x = circles[j]['y'];
                        let circle_y = circles[j]['x'];
                        let distance_line_circle = findDistance(circle_x, circle_y, x2, y2);
                        if (distance_line_circle < circles[j]['radius'] * 2) {
                            line.end = circles[j]['name'];
                            index_checker++;
                        }
                    }
                    console.log(line)
                    if (index_checker === 2) {
                        allLines.push(line);
                    }
                }
            }
            console.log(allLines);
            return [allLines, circles];

            // console.log(allLines);
        }
    }))
//Function to find the distance between two points
    function findDistance(x1, y1, x2, y2) {
        let x2_x1 = Math.pow(x2 -x1 ,2)
        let y2_y1 = Math.pow( y2-y1 , 2)
        let distance = Math.sqrt(x2_x1 + y2_y1)
        return distance;
    }
// Function to find the circle on
// which the given three points lie
function findCircle(x1,  y1,  x2,  y2)
{
    return [(x1 + x2) / 2, (y1 + y2) / 2];
}

    const [lines, setLines] = useState([]);
    const isDrawing = useRef(false);

    const handleMouseDown = (e) => {
        isDrawing.current = true;
        const pos = e.target.getStage().getPointerPosition();
        setLines([...lines, { points: [pos.x, pos.y] }]);
    };

    const handleMouseMove = (e) => {
        // no drawing - skipping
        if (!isDrawing.current) {
          return;
        }
        const stage = e.target.getStage();
        const point = stage.getPointerPosition();
    
        // To draw line
        let lastLine = lines[lines.length - 1];
        
        if(lastLine) {
            // add point
            lastLine.points = lastLine.points.concat([point.x, point.y]);
                
            // replace last
            lines.splice(lines.length - 1, 1, lastLine);
            setLines(lines.concat());
        }        
    };

    onkeydown = (event) => {
        console.log(event.keyCode);
        if (event.keyCode === 8) {
            if (lines.length > 0) {
                setLines(lines.splice(0, lines.length - 1));
            }
        }
    }
    const handleMouseUp = () => {
        isDrawing.current = false;
        console.log(lines);
    };

    return (
        <div>         
            
        
        <div className='row'>
                <div className='col-2'>
                <h3 style={{padding:10}}>Drawing Area</h3>
            </div>
            <div className='col-8'>
            <Stage
                width={965}
                height={580}
                onMouseDown={handleMouseDown}
                onMousemove={handleMouseMove}
                onMouseup={handleMouseUp}
                className="canvas-stage"
                    style={stageStyle}
            >
                <Layer>
                    {lines.map((line, i) => (
                        <Line
                        key={i}
                        points={line.points}
                        stroke="#000000"
                        strokeWidth={3}
                        tension={0.5}
                        fill={'black'}
                        lineCap="round"
                        globalCompositeOperation={
                            line.tool === 'eraser' ? 'destination-out' : 'source-over'
                        }
                        />
                    ))}
                </Layer>
                </Stage>
                </div>
            </div>
            </div>
    )
})

export default DrawingArea

const stageStyle = {
    boxShadow: '0 20px 16px 0 rgba(0,0,0,0.2)',
    padding: '20',
    margin: '20px'
  }