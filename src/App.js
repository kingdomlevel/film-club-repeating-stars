import { useState, useEffect } from 'react';
import env from "react-dotenv";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import './App.css';
import FilmInput from './components/FilmInput';

function App() {
  const [filmNames, setFilmNames] = useState([]);
  const [chartOptions, setChartOptions] = useState(null);

  const getActorOccurences = actorAppearancess => {
    const uniqueActorAppearances = {};

    for (let actorAppearance of actorAppearancess) {
      if (uniqueActorAppearances.hasOwnProperty(actorAppearance.name)) {
        uniqueActorAppearances[actorAppearance.name].count += 1;
        uniqueActorAppearances[actorAppearance.name].films.push(actorAppearance.film);
      } else {
        uniqueActorAppearances[actorAppearance.name] = {
          count: 1,
          films: [actorAppearance.film]
        };
      }
    }

    return uniqueActorAppearances;
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
        // get actors from film data
        const repeatingActors = filmDetailResults.map((film, index) => film.cast.map(actor => {
          return {
            name: actor.name, 
            film: filmNames[index]
          }
        })).flat();
        const actorOccurences = getActorOccurences(repeatingActors);
        console.log('actor occurences', actorOccurences);

        // set chart data
        const chartOptions = {
          chart: {
            type: 'column'
          },
          tooltip: {
            formatter: function() {
              return formatTooltip(this.point.appearsIn);
            }
          },
          title: {
            text: 'Actor appearances'
          },
          xAxis: {
            type: 'category'
          },
          yAxis: {
            title: {
              text: 'number of appearances'
            }
          },
          series: [
            {
              name: "appearances",
              data: null
            }
          ]
        };

        const chartSeries = [];
        for (let actorName in actorOccurences) {
          const bar = {
            name: actorName,
            y: actorOccurences[actorName].count,
            appearsIn: actorOccurences[actorName].films
          }
          chartSeries.push(bar);
        };

        // sort descending
        chartSeries.sort((actor1, actor2) => actor2.y - actor1.y);



        chartOptions.series[0].data = chartSeries.slice(0, 15);

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

  const formatTooltip = filmAppearances => {
    let output = "Appears in:"
    const bullets = filmAppearances.reduce((list, filmName) => {
      return list + `<br/>  • ${filmName}`
    }, '')
    return output + bullets;
    

  };

  return (
    <div className="App">
      <FilmInput setFilmNames={setFilmNames}/>
      {actorChart}
      <p>cast data from <a href="https://www.themoviedb.org/">The Movie Database</a></p>
    </div>
  );
}

export default App;
