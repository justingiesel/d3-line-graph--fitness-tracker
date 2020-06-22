// 1) Margins vars
// 2) Graph dimensions
// 3) svg container
// 4) Graph group
// 5) update data var
// 6) data array
// 7) db firestore -- switch


const margin = { top: 40, right: 20, bottom: 50, left: 100};
const graphWidth = 560 - margin.left - margin.right;
const graphHeight = 400 - margin.top - margin.bottom;

const svg = d3.select('.canvas')
    .append('svg')
    .attr('width', graphWidth + margin.left + margin.right)
    .attr('height', graphHeight + margin.left + margin.right);

const graph = svg.append('g')
    .attr('width', graphWidth)
    .attr('height', graphHeight)
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

// scales
const x = d3.scaleTime().range([0, graphWidth]);
const y = d3.scaleLinear().range([graphHeight, 0]);

//  axis groups
const xAxisGroup = graph.append('g')
    .attr('class', 'x-axis')
    .attr('transform', "translate(0," + graphHeight + ")");

const yAxisGroup = graph.append('g')
    .attr('class', 'y-axis');

const update = (data) => {
    
    // filter data to activity
    data = data.filter(item => item.activity == activity);

    // set scale domains
    x.domain(d3.extent(data, d => new Date(d.date)));
    y.domain([0, d3.max(data, d => d.distance)]);

    // create crcles for objects
    const circles = graph.selectAll('circle')
        .data(data)

    // remove unwanted points
    circles.exit().remove();

    // update current points positions
    circles
        .attr('cx', d => x(new Date(d.date)))
        .attr('cy', d =>  y(d.distance))

    // add new points
    circles.enter()
        .append('circle')
            .attr('r', 4)
            .attr('cx', d => x(new Date(d.date)))
            .attr('cy', d =>  y(d.distance))
            .attr('fill', '#ccc')

    // create axes
    const xAxis = d3.axisBottom(x)
        .ticks(4)
        .tickFormat(d3.timeFormat('%b %d'));

    const yAxis = d3.axisLeft(y)
        .ticks(4)
        .tickFormat(d => d + 'm');

    // call axes
    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

    // rotate axis text
    xAxisGroup.selectAll('text')
        .attr('transform', 'rotate(-40)')
        .attr('text-anchor', 'end')

    console.log(data);
}

// data array & firestore
var data = [];

db.collection('activities').onSnapshot(res => {

    res.docChanges().forEach(change => {

        const doc = {...change.doc.data(), id: change.doc.id};

        switch (change.type) {
            case 'added':
                data.push(doc);
                break;
            case 'modified':
                const index = data.findIndex(item => item.id == doc.id);
                data[index] = doc;
                break;
            case 'removed':
                data = data.filter(item => item.id !== doc.id);
                break;
            default:
                break;
        }
    })

    update(data);

})