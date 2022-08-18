import React, { useEffect, useRef, useState } from 'react';
import 'react-dropdown/style.css';
import DrawingArea from './components/DrawingArea';
import VisualizingArea from './components/VisualizingArea';
const App = () => {
  const [circles, setCircles] = useState([]);
  const [lines, setLines] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [created, setCreated] = useState(false);
  const [draw, setDraw] = useState(true);
  const [visualizing, setVisualizing] = useState(false);
   useEffect(() => {
     console.log('re-rendering')
  }, [created, draw, lines, circles, visualizing])
  const visualize = useRef(null);
  const drawRef = useRef(null);


  async function generate() {
    var [line,circle] = drawRef.current.generate();
    setLines(line);
    setCircles(circle);
    setDraw(false);

    var nodes = await visualize.current.generate(line, circle)
    setNodes(nodes);
    setCreated(true);
  }

  function drawImage() {
    setDraw(true);
    setCreated(false);
  }

  function clearDrawing() {
    drawRef.current.clearDrawing();
  }
  function clearPaths() {
    visualize.current.clearPaths();
  }

  async function visualizeSearch() {
    setVisualizing(true);
    console.log(visualizing);
    await visualize.current.start();
    console.log(visualizing);
    setVisualizing(false);
  }

  return (
    <div>
      <div className="adjust-content-center">
        <nav className=" ms-auto  navbar-expand-lg navbar bg-dark p-3">
            <a href="#" className="navbar-brand text-light text-uppercase">Shortest Path</a>
          <button  onClick={() => generate()} style={{ marginLeft: 40, display: draw ? '' : 'none' }} className='btn btn-primary'>Create New Image</button>
          <button disabled = {visualizing}  onClick={() => drawImage()} style={{ marginLeft: 40, display: draw ? 'none' : ''}} className='btn btn-primary'>Draw Image</button>

            <select onChange={(e) => visualize.current.setStartingNode(e.target.value, null)} style={{marginLeft:80, height:40, borderRadius:5, color:'black'}} defaultValue={"Starting Node"}>
            <option disabled>Starting Node</option>
              {nodes.map((node) => 
                <option key={node}>{node}</option>
            )}
            </select>

            <select onChange={(e) => visualize.current.setEndingNode(e.target.value, null)}  style={{marginLeft:20, height:40, borderRadius:5, color:'black'}} defaultValue={"Ending Node"}>
              <option disabled>Ending Node</option>
              {nodes.map((node) => 
                <option key={node}>{node}</option>
            )}
            
            </select> 
            <input onChange={e => visualize.current.changeSpeed(e)} style={{ marginLeft: 60, width: 170 }} type="text" className="form-control" placeholder="Speed (Default 1s)" aria-label="speed" aria-describedby="speed" />
            <select style={{marginLeft:20, height:40, borderRadius:5, color:'black'}} defaultValue={"Djikstra"}>
            <option disabled>Choose Algorithm</option>
            <option>Djikstra</option>
          </select>
          <button  onClick={() => clearDrawing()} style={{ marginLeft: 40, display: draw ? '' : 'none' }} className='btn btn-primary'>Clear Drawing</button>
          <button disabled ={visualizing}  onClick={() => clearPaths()} style={{ marginLeft: 40, display: draw ? 'none' : ''}} className='btn btn-primary'>Clear Paths</button>

            <button disabled={draw} key={'button'} onClick={() => visualizeSearch()} style={{float:'inline-end'}} className='btn btn-warning ml-auto'>Visualize</button>
          </nav>
      </div>
      <div style={{display: draw?'none':''}}>
      <VisualizingArea  ref={visualize} data={[lines, circles, nodes, created]} />
      </div>
      <div style={{display: !draw?'none':''}}>
      <DrawingArea ref={drawRef} />

      </div>
    </div>


  )
};

export default App
