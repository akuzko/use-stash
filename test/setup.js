import jsdom from "jsdom";
import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";

const { JSDOM } = jsdom;

Enzyme.configure({ adapter: new Adapter() });

const dom = new JSDOM("<!doctype html><html><body></body></html>");
global.window = dom.window;
global.document = dom.window.document;
