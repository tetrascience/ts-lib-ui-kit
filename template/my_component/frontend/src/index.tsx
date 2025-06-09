import React from "react"
import ReactDOM from "react-dom"
import MyComponent from "./MyComponent"
import AtomsShowcase from "./AtomsShowcase/AtomsShowcase"
import MoleculesShowcase from "./MoleculesShowcase/MoleculesShowcase"
import OrganismsShowcase from "./OrganismsShowcase/OrganismsShowcase"

ReactDOM.render(
  <React.StrictMode>
    <MyComponent />
    <AtomsShowcase />
    <MoleculesShowcase />
    <OrganismsShowcase />
  </React.StrictMode>,
  document.getElementById("root")
)
