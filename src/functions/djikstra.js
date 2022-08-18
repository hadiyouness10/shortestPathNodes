class Graph {
    constructor() {
        this.vertices = [];
        this.adjacencyList = {};
    }

    addVertex(vertex) {
        this.vertices.push(vertex);
        this.adjacencyList[vertex] = {};
    }

    addEdge(vertex1, vertex2, weight) {
        this.adjacencyList[vertex1][vertex2] = weight;
    }

    changeWeight(vertex1, vertex2, weight) {
        this.adjacencyList[vertex1][vertex2] = weight;
    }
    dijkstra(source, destination) {
        let distances = {},
            parents = {},
            visited = new Set();
        for (let i = 0; i < this.vertices.length; i++) {
            if (this.vertices[i] === source) {
                distances[source] = 0;
            } else {
                distances[this.vertices[i]] = Infinity;
            }
            parents[this.vertices[i]] = null;
        }

        let currVertex = this.vertexWithMinDistance(distances, visited);
        let steps = [];
        while (currVertex !== null) {
            let current_step = {
                'circle': currVertex,
                'neighbors': [],
                'lines': [],
                'logs': '- Currently Visiting Node ' + currVertex
            };
            steps.push(current_step);
            let distance = distances[currVertex],
                neighbors = this.adjacencyList[currVertex];
            // console.log('Node ' + currVertex + ' has ' + Object.keys(neighbors).length + ' neighbors')
            let current_circle = currVertex;
            let current_lines = [];
            let current_neighbors = [];
            let current_neighbors_logs = "";
            for (let neighbor in neighbors) {
                current_neighbors.push(neighbor);
                current_neighbors_logs += neighbor + ", ";
                current_lines.push(this.line_id(currVertex, neighbor));
            }
            current_step = {
                'circle': current_circle,
                'lines': current_lines,
                'neighbors': current_neighbors,
                'logs': '\t ->Node ' + currVertex + ' has ' + Object.keys(neighbors).length + ' neighbor' + (current_neighbors.length !== 1 ? 's' : '') + (current_neighbors.length > 0 ? ': ' : '') + current_neighbors_logs.substring(0, current_neighbors_logs.length - 2)
            }
            steps.push(current_step);
            for (let neighbor in neighbors) {
                let newDistance = distance + neighbors[neighbor];
                if (distances[neighbor] > newDistance) {
                    // console.log('New Distance of ' + neighbor + ' is ' +
                    //     newDistance)

                    current_step = {
                        'circle': current_circle,
                        'lines': current_lines,
                        'neighbors': current_neighbors,
                        'logs': '\t\t * New Distance of Node ' + neighbor + ' is ' + newDistance
                    };
                    steps.push(current_step)
                    distances[neighbor] = newDistance;
                    parents[neighbor] = currVertex;
                } else {
                    current_step = {
                        'circle': current_circle,
                        'lines': current_lines,
                        'neighbors': current_neighbors,
                        'logs': "\t\t * Keep old distance of Node " + neighbor + ": " + distances[neighbor] + " <= " + newDistance
                    };
                    steps.push(current_step)
                }
            }
            visited.add(currVertex);
            currVertex = this.vertexWithMinDistance(distances, visited);
        }
        console.log(steps)
            // console.log(parents);
        console.log(distances);
        // console.log(this.goBackward(parents, source, destination, distances));
        const [path, distance] = this.goBackward(parents, source, destination, distances);
        // var distances_to_return = [];
        // for (var k = 0; k < distances.length; k++){
        //     distances_to_return.pu
        // }
        return { parents, distances, steps, path };
    }
    goBackward(parents, start, end, distances) {
        let distance = 0;
        if (distances[end] === Infinity) {
            return [
                [], Infinity
            ];
        }
        let path = [];
        let current_node = end;
        if (current_node !== undefined)
            path.push(current_node);
        while (true) {
            if (current_node !== null && current_node !== undefined)
                distance += distances[current_node];
            current_node = parents[current_node];
            distance += distances[current_node];

            if (current_node !== undefined)
                path.push(current_node);
            else return [path.reverse(), distance];
            if (current_node === start) {
                return [path.reverse(), distance];
            }
        }
    }
    vertexWithMinDistance(distances, visited) {
        let minDistance = Infinity,
            minVertex = null;
        for (let vertex in distances) {
            let distance = distances[vertex];
            if (distance < minDistance && !visited.has(vertex)) {
                minDistance = distance;
                minVertex = vertex;
            }
        }
        return minVertex;
    }
    line_id(start, end) {
        // console.log(start < end ? start + "_" + end : end + "_" + start)
        return start < end ? start + "_" + end : end + "_" + start;
    }
}
export default Graph;
let g = new Graph();

// add the vertices
g.addVertex('A');
g.addVertex('B');
g.addVertex('C');
g.addVertex('D');

// create the edges
g.addEdge('A', 'B', 3);
g.addEdge('A', 'C', 2);
g.addEdge('B', 'D', 2);
g.addEdge('C', 'D', 6);

// run dijkstra's algorithm, with A as the source vertex.
g.dijkstra('A', 'D');

// should log
// { A: null, B: 'A', C: 'A', D: 'B' }
// { A: 0, B: 3, C: 2, D: 5 }