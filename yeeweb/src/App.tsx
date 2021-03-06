import React, {useState, useEffect, useRef} from 'react';
import { toState, toColor, toDecimal, decimalColorToHTMLcolor } from './lib/getColor';
import { Slide,Container } from '@material-ui/core';
import { sendComand } from './components/requests';
import { ColorController } from './components/colorController'
import { Heading } from './components/heading'
import { Background } from './components/background'
import { makeStyles } from '@material-ui/styles';
import { ThreeModel } from './components/model/3dModel'
import { IpAddress } from './components/lightAddress/.'
import './App.css'
const url = 'http://localhost:8000'

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    fontFamily: '"HelveticaNeue"'
  },
  lampModel: {
    position: 'absolute',
    zIndex: 0,
  }
});

const initialFlowColor = [
  {
    color: toDecimal('#2c9c49')
  },
  {
    color: toDecimal('#00FFE6')
  },
  {
    color: toDecimal('#ffff')
  },
  {
    color: toDecimal('#000')
  },
]

function App() {
  const [currentColor, setCurrentColor] = useState(toDecimal('5844012'));
  const [colorFlow, setColorFlow] = useState(initialFlowColor)
  const [currentHexColor, setCurrentHexColor] = useState('#00FFE6');
  const [currentBrightness, setCurrentBrightness] = useState<number>(30);
  const [powerStatus, setCurrentPowerStatus] = useState(false);
  const [openState, setOpenState] = useState(false);
  const getInitialData = useRef(false);
  const handleFlowColorChange = (oldColor: any, newColor: any) => {
    colorFlow.map((currentColor: any, i: number) => {
      if(currentColor.color.hex === oldColor.hex) {
        const newColorSet = colorFlow;
        newColorSet[i].color = newColor;
        setColorFlow(newColorSet)
      }
    })
  }
  console.log(colorFlow)


  const handleColorChange = (color: any) => {
    setCurrentColor(color);
    setCurrentHexColor(color.hex);
    console.log(color.rgb);
    sendComand(`${url}/changeLight`, color.rgb);
  }

  const togglePowerState = () => {
    const newStatus = !powerStatus
    const status = sendComand(`${url}/setPower`, {powerStatus: newStatus});
    console.log(newStatus)
    setCurrentPowerStatus(newStatus)
    console.log(status)
  }

  const handleBrightnessChange = (event : any, currentBrightnessSlide: number) => {
    setCurrentBrightness(currentBrightnessSlide)
    const status = sendComand(`${url}/setBrightness`, {currentBrightnessSlide});
    console.log(status)
  }
  const handleColorChangeSaturation = (color: any) => {
    const newColor = toColor(color);
    setCurrentColor(newColor)
    setCurrentHexColor(newColor.hex)
    sendComand(`${url}/changeLight`, newColor.rgb)
  }

  useEffect(() => {
    if(!getInitialData.current) {
      console.log(getInitialData.current)
      const body= {parms: ['power','bright',"rgb",'ct' ]}
      sendComand(`${url}/getStatus`, body).then(result => {
        console.log(result);
        if(result === undefined) throw new Error('No Resut Found');
        if(result[1]) setCurrentBrightness(parseInt(result[1]))
        if(result[0] === 'on') setCurrentPowerStatus(true);
        if(result[0] === 'off') setCurrentPowerStatus(false);
        if(result[2]) {
          const getColor = decimalColorToHTMLcolor(result[2]);
          console.log(result[2],getColor)
          setCurrentColor(getColor);
          setCurrentHexColor(getColor.hex)
        }
        getInitialData.current = true;
      })
    }
  })

  const classes = useStyles();
  return (
      <div className={classes.root}>
        <Background/>
              <div className={classes.lampModel}>
                <ThreeModel
                  currentHexColor={currentHexColor}
                  currentBrightness={currentBrightness}
                />
              </div>
              <Heading />
          {/* <Slide direction="left" in={!openState} mountOnEnter unmountOnExit timeout={600}> */}
            <Container style={{ position: 'fixed',left: `${!openState ? '2%': '20%'}`,top: '25%', transition: 'left 500ms'}}>
              <ColorController
                handleColorChange={handleColorChange}
                handleColorChangeSaturation={handleColorChangeSaturation}
                currentHexColor={currentHexColor}
                currentColor={currentColor}
                handleBrightnessChange={handleBrightnessChange}
                currentBrightness={currentBrightness}
                powerStatus={powerStatus}
                togglePowerState={togglePowerState}
                colorFlow={colorFlow}
                handleFlowColorChange={handleFlowColorChange}
              />
            </Container>
          {/* </Slide> */}
        <IpAddress
          setOpenState={setOpenState}
          openState={openState}
        />
      </div>
  );
}

export default App;
