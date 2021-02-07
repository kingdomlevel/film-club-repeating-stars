import { useState, useEffect } from 'react';
import env from "react-dotenv";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import './App.css';
import FilmInput from './components/FilmInput';

function App() {
  const [filmNames, setFilmNames] = useState([]);
  const [chartOptions, setChartOptions] = useState(null);

  const getActorOccurences = actors => {
    const appearences = {};

    for (let actor of actors) {
      if (appearences.hasOwnProperty(actor)) {
        appearences[actor] += 1;
      } else {
        appearences[actor] = 1;
      }
    }

    return appearences;
  }

  useEffect(() => {
    const filmPromises = filmNames.map(title => {
      return fetch(`http://www.omdbapi.com/?t=${title}&apikey=${env.OMDB_API_KEY}`)
              .then(res => res.json())
    });

    Promise.all(filmPromises).then(allFilmData => {
      console.log('all film data:', allFilmData);
      
      // get actors from film data
      const repeatingActors = allFilmData.map(film => film.Actors.split(', ')).flat();
      const actorOccurences = getActorOccurences(repeatingActors);
      console.log('actor occurences', actorOccurences);

      // set chart data
      const chartOptions = {
        chart: {
          type: 'bar'
        },
        title: {
          text: 'Actor appearences'
        }
      };

      const chartSeries = [];
      for(let actorName in actorOccurences) {
        const bar = {
          name: actorName,
          data: actorOccurences[actorName]
        }
        chartSeries.push(bar);
      };

      // sort descending
      chartSeries.sort((actor1, actor2) => actor2.data - actor1.data);

      

      chartOptions["series"] = chartSeries.slice(0, 15);

      setChartOptions(chartOptions);

    });
  }, [filmNames]);



  let actorChart = null;
  if (chartOptions) {
    actorChart = <HighchartsReact highcharts={Highcharts} options={chartOptions} />;
  } else {
    actorChart = null;
  }

  return (
    <div className="App">
      <FilmInput setFilmNames={setFilmNames}/>
      {actorChart}
    </div>
  );
}

export default App;
