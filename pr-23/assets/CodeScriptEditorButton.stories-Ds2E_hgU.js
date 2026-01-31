import{j as e}from"./jsx-runtime-CDt2p4po.js";import{r}from"./index-GiUgBvb1.js";import{a as y}from"./styled-components.browser.esm-Ctfm6iBV.js";import{B as Ce}from"./Button-tnMIwByE.js";import{C as ye}from"./CodeEditor-fKz404PR.js";import{I as he,a as ve}from"./Icon-CuK57VyF.js";import{M as Se}from"./Modal-sd89y6Dy.js";import"./iframe-BAqoMiQf.js";import"./Tooltip-DeRvpXCR.js";const be=y.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 16px;
  flex-wrap: wrap;
  width: 100%;
`,xe=y.div`
  margin: 16px 0;
`,Ee=y.span`
  font-size: 12px;
  color: var(--grey-400);
`,oe=({initialCode:a="",onCodeSave:f,language:ne="python",buttonText:se="Edit Code",modalTitle:ie="Edit Code",buttonProps:le,modalProps:de,disabled:ce=!1})=>{const[pe,C]=r.useState(!1),[t,h]=r.useState(a),v=t?t.split(`
`).length:0,S=t.length,me=r.useCallback(()=>{h(a),C(!0)},[a]),ue=r.useCallback(()=>{f&&f(t),C(!1)},[f,t]),ge=r.useCallback(()=>{C(!1)},[]),_e=r.useCallback(fe=>{h(fe||"")},[]);return e.jsxs(e.Fragment,{children:[e.jsxs(be,{children:[e.jsx(Ce,{leftIcon:e.jsx(he,{name:ve.PENCIL}),onClick:me,size:"small",variant:"tertiary",...le,disabled:ce,style:{height:38},children:se}),e.jsxs(Ee,{title:`${v} lines, ${S} characters`,children:[v," lines / ",S," chars"]})]}),e.jsx(Se,{isOpen:pe,onClose:ge,onConfirm:ue,onCloseLabel:"Cancel",onConfirmLabel:"Save Code",title:ie,width:"80%",...de,children:e.jsx(xe,{children:e.jsx(ye,{height:"400px",language:ne,value:t,onChange:_e,options:{minimap:{enabled:!1}}})})})]})};oe.__docgenInfo={description:"Renders an 'Edit code' button that opens a modal with a Monaco code editor.",methods:[],displayName:"CodeScriptEditorButton",props:{initialCode:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'""',computed:!1}},onCodeSave:{required:!1,tsType:{name:"signature",type:"function",raw:"(newCode: string) => void",signature:{arguments:[{type:{name:"string"},name:"newCode"}],return:{name:"void"}}},description:""},language:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"python"',computed:!1}},buttonText:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Edit Code"',computed:!1}},modalTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Edit Code"',computed:!1}},buttonProps:{required:!1,tsType:{name:"ReactComponentProps",raw:"React.ComponentProps<typeof Button>",elements:[{name:"Button"}]},description:""},modalProps:{required:!1,tsType:{name:"Omit",elements:[{name:"ReactComponentProps",raw:"React.ComponentProps<typeof Modal>",elements:[{name:"Modal"}]},{name:"union",raw:'"isOpen" | "onConfirm" | "onClose"',elements:[{name:"literal",value:'"isOpen"'},{name:"literal",value:'"onConfirm"'},{name:"literal",value:'"onClose"'}]}],raw:`Omit<
  React.ComponentProps<typeof Modal>,
  "isOpen" | "onConfirm" | "onClose"
>`},description:""},disabled:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},isEditMode:{required:!1,tsType:{name:"boolean"},description:""}}};const Oe={title:"Molecules/CodeScriptEditorButton",component:oe,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{language:{control:{type:"select"},options:["python","javascript","typescript","sql","json","yaml"]},disabled:{control:{type:"boolean"}},isEditMode:{control:{type:"boolean"}}}},o={args:{initialCode:`def hello_world():
    print("Hello, World!")
    return "Hello, World!"

hello_world()`,language:"python"}},n={args:{initialCode:"",language:"python"}},s={args:{initialCode:`function helloWorld() {
  console.log("Hello, World!");
  return "Hello, World!";
}

helloWorld();`,language:"javascript"}},i={args:{initialCode:`SELECT 
  id,
  name,
  email,
  created_at
FROM users 
WHERE active = true
ORDER BY created_at DESC
LIMIT 10;`,language:"sql"}},l={args:{initialCode:`{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "age": 30,
  "active": true,
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}`,language:"json"}},d={args:{initialCode:`def example():
    return "This editor is disabled"`,language:"python",disabled:!0}},c={args:{initialCode:`# Custom configuration script
config = {
    "api_endpoint": "https://api.example.com",
    "timeout": 30,
    "retries": 3
}`,language:"python",buttonText:"Configure Script",modalTitle:"Script Configuration"}},p={args:{initialCode:'print("Initial code")',language:"python",onCodeSave:a=>{console.log("Code saved:",a),alert(`Code saved! Length: ${a.length} characters`)}}},m={args:{initialCode:`import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

def load_and_preprocess_data(file_path):
    """
    Load and preprocess the dataset
    """
    # Load the data
    data = pd.read_csv(file_path)
    
    # Handle missing values
    data = data.dropna()
    
    # Feature engineering
    data['feature_1_squared'] = data['feature_1'] ** 2
    data['feature_interaction'] = data['feature_1'] * data['feature_2']
    
    return data

def train_model(X, y):
    """
    Train a Random Forest model
    """
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Initialize and train the model
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42
    )
    model.fit(X_train, y_train)
    
    # Make predictions
    y_pred = model.predict(X_test)
    
    # Evaluate the model
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred)
    
    print(f"Accuracy: {accuracy:.4f}")
    print("Classification Report:")
    print(report)
    
    return model

# Main execution
if __name__ == "__main__":
    # Load and preprocess data
    data = load_and_preprocess_data("dataset.csv")
    
    # Prepare features and target
    X = data.drop('target', axis=1)
    y = data['target']
    
    # Train the model
    model = train_model(X, y)
    
    print("Model training completed!")`,language:"python"}},u={args:{initialCode:'console.log("Small button example");',language:"javascript",buttonProps:{size:"small"}}},g={args:{initialCode:'console.log("Primary button example");',language:"javascript",buttonProps:{variant:"primary"}}},_={args:{initialCode:'console.log("Secondary button example");',language:"javascript",buttonProps:{variant:"secondary"}}};var b,x,E;o.parameters={...o.parameters,docs:{...(b=o.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    initialCode: \`def hello_world():
    print("Hello, World!")
    return "Hello, World!"

hello_world()\`,
    language: "python"
  }
}`,...(E=(x=o.parameters)==null?void 0:x.docs)==null?void 0:E.source}}};var T,j,R;n.parameters={...n.parameters,docs:{...(T=n.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    initialCode: "",
    language: "python"
  }
}`,...(R=(j=n.parameters)==null?void 0:j.docs)==null?void 0:R.source}}};var M,L,P;s.parameters={...s.parameters,docs:{...(M=s.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    initialCode: \`function helloWorld() {
  console.log("Hello, World!");
  return "Hello, World!";
}

helloWorld();\`,
    language: "javascript"
  }
}`,...(P=(L=s.parameters)==null?void 0:L.docs)==null?void 0:P.source}}};var k,w,B;i.parameters={...i.parameters,docs:{...(k=i.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    initialCode: \`SELECT 
  id,
  name,
  email,
  created_at
FROM users 
WHERE active = true
ORDER BY created_at DESC
LIMIT 10;\`,
    language: "sql"
  }
}`,...(B=(w=i.parameters)==null?void 0:w.docs)==null?void 0:B.source}}};var O,W,X;l.parameters={...l.parameters,docs:{...(O=l.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    initialCode: \`{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "age": 30,
  "active": true,
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}\`,
    language: "json"
  }
}`,...(X=(W=l.parameters)==null?void 0:W.docs)==null?void 0:X.source}}};var I,q,H;d.parameters={...d.parameters,docs:{...(I=d.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    initialCode: \`def example():
    return "This editor is disabled"\`,
    language: "python",
    disabled: true
  }
}`,...(H=(q=d.parameters)==null?void 0:q.docs)==null?void 0:H.source}}};var F,D,z;c.parameters={...c.parameters,docs:{...(F=c.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    initialCode: \`# Custom configuration script
config = {
    "api_endpoint": "https://api.example.com",
    "timeout": 30,
    "retries": 3
}\`,
    language: "python",
    buttonText: "Configure Script",
    modalTitle: "Script Configuration"
  }
}`,...(z=(D=c.parameters)==null?void 0:D.docs)==null?void 0:z.source}}};var J,N,V;p.parameters={...p.parameters,docs:{...(J=p.parameters)==null?void 0:J.docs,source:{originalSource:`{
  args: {
    initialCode: \`print("Initial code")\`,
    language: "python",
    onCodeSave: (code: string) => {
      console.log("Code saved:", code);
      alert(\`Code saved! Length: \${code.length} characters\`);
    }
  }
}`,...(V=(N=p.parameters)==null?void 0:N.docs)==null?void 0:V.source}}};var $,A,Q;m.parameters={...m.parameters,docs:{...($=m.parameters)==null?void 0:$.docs,source:{originalSource:`{
  args: {
    initialCode: \`import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

def load_and_preprocess_data(file_path):
    """
    Load and preprocess the dataset
    """
    # Load the data
    data = pd.read_csv(file_path)
    
    # Handle missing values
    data = data.dropna()
    
    # Feature engineering
    data['feature_1_squared'] = data['feature_1'] ** 2
    data['feature_interaction'] = data['feature_1'] * data['feature_2']
    
    return data

def train_model(X, y):
    """
    Train a Random Forest model
    """
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Initialize and train the model
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42
    )
    model.fit(X_train, y_train)
    
    # Make predictions
    y_pred = model.predict(X_test)
    
    # Evaluate the model
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred)
    
    print(f"Accuracy: {accuracy:.4f}")
    print("Classification Report:")
    print(report)
    
    return model

# Main execution
if __name__ == "__main__":
    # Load and preprocess data
    data = load_and_preprocess_data("dataset.csv")
    
    # Prepare features and target
    X = data.drop('target', axis=1)
    y = data['target']
    
    # Train the model
    model = train_model(X, y)
    
    print("Model training completed!")\`,
    language: "python"
  }
}`,...(Q=(A=m.parameters)==null?void 0:A.docs)==null?void 0:Q.source}}};var Y,G,K;u.parameters={...u.parameters,docs:{...(Y=u.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  args: {
    initialCode: \`console.log("Small button example");\`,
    language: "javascript",
    buttonProps: {
      size: "small"
    }
  }
}`,...(K=(G=u.parameters)==null?void 0:G.docs)==null?void 0:K.source}}};var U,Z,ee;g.parameters={...g.parameters,docs:{...(U=g.parameters)==null?void 0:U.docs,source:{originalSource:`{
  args: {
    initialCode: \`console.log("Primary button example");\`,
    language: "javascript",
    buttonProps: {
      variant: "primary"
    }
  }
}`,...(ee=(Z=g.parameters)==null?void 0:Z.docs)==null?void 0:ee.source}}};var ae,te,re;_.parameters={..._.parameters,docs:{...(ae=_.parameters)==null?void 0:ae.docs,source:{originalSource:`{
  args: {
    initialCode: \`console.log("Secondary button example");\`,
    language: "javascript",
    buttonProps: {
      variant: "secondary"
    }
  }
}`,...(re=(te=_.parameters)==null?void 0:te.docs)==null?void 0:re.source}}};const We=["Default","Empty","JavaScript","SQL","JSON","Disabled","CustomLabels","WithCallback","LongCode","SmallButton","PrimaryButton","SecondaryButton"];export{c as CustomLabels,o as Default,d as Disabled,n as Empty,l as JSON,s as JavaScript,m as LongCode,g as PrimaryButton,i as SQL,_ as SecondaryButton,u as SmallButton,p as WithCallback,We as __namedExportsOrder,Oe as default};
