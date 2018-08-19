import React, {Fragment} from "react";
import {Route} from "react-router-dom";
import IndexPage from "./pages";
import Step1 from "./pages/Step1";
import Step2 from "./pages/Step2";

const App = () => (
	<Fragment>
		<Route path="/" component={IndexPage}/>
		<Route path="/step1" component={Step1}/>
		<Route path="/step2" component={Step2}/>
	</Fragment>
);

export default App;
