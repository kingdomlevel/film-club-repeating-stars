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
      return fetch(`https://api.themoviedb.org/3/search/movie?query=${title}&api_key=${env.TMDB_API_KEY}`)
              .then(res => res.json())
    });

    Promise.all(filmPromises).then(filmSearchResults => {
      console.log('all film data:', filmSearchResults);
      const filmIds = filmSearchResults.map(searchRes => searchRes.results[0].id);
      const filmDetailPromises = filmIds.map(id => {
        return fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${env.TMDB_API_KEY}&language=en-US`)
                  .then(res => res.json())
        }
      );

      Promise.all(filmDetailPromises).then(filmDetailResults => {
        debugger;
        // get actors from film data
        const repeatingActors = filmDetailResults.map(film => film.cast.map(actor => actor.name)).flat();
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
        for (let actorName in actorOccurences) {
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
      })
      
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
