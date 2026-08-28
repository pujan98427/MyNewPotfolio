import React from "react";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle";
import Home from "./Home";
import Navbar from "./Navbar"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
const App = () => {
	return (
		<>
			<Router>
				<Navbar />
				<Routes>
					<Route exact path="/" element={<Home />} />
					<Route exact path="/home" />
					<Route exact path="#about" />
					<Route exact path="#job-history" />
					<Route exact path="#skill" />
					<Route exact path="#contact" />
					<Route render={() => <Navigate to="/" />} />
				</Routes>
			</Router>



		</>
	)
}
export default App;
