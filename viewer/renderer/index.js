/* global window, d3, dagreD3 */
const choice = require('./shapes/choice');
const final = require('./shapes/final');
const initial = require('./shapes/initial');
const state = require('./shapes/state');

const { scalingFactor } = require('./tools');

module.exports = renderer;
function renderer(spec) {
  // Create a new directed graph
  const g = new dagreD3.graphlib.Graph().setGraph({});

  g.setNode(spec.initial, { shape: "initial", label: "" });

  spec.final.forEach(state => {
    g.setNode(state, { shape: "final", label: "" });
  });

  spec.states.forEach(state => {
    g.setNode(state.name, { shape: "state", label: state.name });
  });

  spec.choices.forEach(state => {
    g.setNode(state, { shape: "choice", label: "" });
  });

  spec.events.forEach(event => {
    if (Array.isArray(event.from)) {
      event.from.forEach(from => {
        g.setEdge(from, event.to, { label: event.label, arrowhead: "vee" });
      });
    } else {
      g.setEdge(event.from, event.to, { label: event.label, arrowhead: "vee" });
    }
  });

  const svg = d3.select("svg");
  const inner = svg.select("g");

  // Set up zoom support
  const zoom = d3.zoom().on("zoom", function() {
    inner.attr("transform", d3.event.transform);
  });
  svg.call(zoom);

  // Fit svg to preview window
  svg.attr("height", window.innerHeight - 5);
  svg.attr("width", window.innerWidth - 5);

  // Create the renderer
  const render = new dagreD3.render();

  // Custom shapes
  render.shapes().initial = initial;
  render.shapes().final = final;
  render.shapes().state = state;
  render.shapes().choice = choice;

  // Run the renderer. This is what draws the final graph.
  render(inner, g);

  // Determine scaling factor
  const initialScale = scalingFactor(g, svg);

  // Center the graph
  const width = (svg.attr("width") - g.graph().width * initialScale) / 2;
  const height = (svg.attr("height") - g.graph().height * initialScale) / 2;

  svg.call(
    zoom.transform,
    d3.zoomIdentity.translate(width, height).scale(initialScale)
  );
}