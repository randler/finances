const { default: axios } = require('axios');
var fs = require('fs');
const options = { style: 'currency', currency: 'BRL' };
const numberFormat = new Intl.NumberFormat('pt-BR', options);
const dateFormat = new Intl.DateTimeFormat("pt-BR",  { month: 'short'});

const getFinances = (async (req, res) => {

    const finances = getJsonFinanceData();
    if(finances == null) {
      res.render('dashboard/index', { finances: [] });
      return;
    }
  
    const { CompNfse } = finances?.ConsultarNfseFaixaResposta?.ListaNfse;
  
    let countNotes = 0;
    let totalAmount = 0;
    let graph = {
      values: [],
      months: []
    };
    CompNfse.forEach( finance => {
      countNotes ++;
      totalAmount += parseFloat(finance.Nfse.InfNfse.ValoresNfse.ValorLiquidoNfse);
      graph.values.push(parseFloat(finance.Nfse.InfNfse.ValoresNfse.ValorLiquidoNfse));
      graph.months.push("" + dateFormat.format(new Date(finance.Nfse.InfNfse.DataEmissao)));
    });

    const { weather, location } = await getAPIForecastWeather();
    const dollar = await getDollarToday();

    const unit = weather?.daily_units?.temperature_2m_max || '' ;
    const maxWeatherToday = weather?.daily?.temperature_2m_max[0] || '';
    const minWeatherToday = weather?.daily?.temperature_2m_min[0] || '';
    const maxWeatherTomorrow = weather?.daily?.temperature_2m_max[1] || '';
    const minWeatherTomorrow = weather?.daily?.temperature_2m_min[1] || '';

    return res.render('dashboard/index', { 
      finances: CompNfse,
      countNotes,
      unit,
      location,
      maxWeatherToday,
      minWeatherToday,
      maxWeatherTomorrow,
      minWeatherTomorrow,
      graph,
      dollar: dollar.data.USDBRL,
      graphValues: graph.values.slice(-12),
      graphMonths: JSON.stringify(graph.months.slice(-12)),
      totalAmount: numberFormat.format(totalAmount),
      avgAmount: numberFormat.format(totalAmount / countNotes)
    });
})

const getDollarToday = async () => {
  
  try {
    return await axios.get('https://economia.awesomeapi.com.br/last/USD-BRL');
  } catch(e) {
    return null;
  }
}

const getJsonFinanceData = () => {
    try {
      return JSON.parse(fs.readFileSync('./static/json/finance.json', 'utf8'));
    } catch(e) {
      console.log('Error:', e.stack);
      return null;
    }
  }

const getAPIForecastWeather = async () => {
    const ip = await axios.get('https://api.ipify.org?format=json');
    const location = await axios.get(`http://ip-api.com/json/${ip.data.ip}`);
    const  { lat, lon } = location.data;
    let weather = null; 
    try {
        const response = await axios.get(`https://api.open-meteo.com/v1/forecast`,{
            params: {
              "latitude": parseFloat(lat).toFixed(5),
              "longitude": parseFloat(lon).toFixed(5),
              "daily": ["weather_code", "temperature_2m_max", "temperature_2m_min", "apparent_temperature_max", "apparent_temperature_min", "precipitation_sum", "rain_sum", "precipitation_hours"],
              "timezone": "America/Sao_Paulo",
              "start_date": "2023-11-04",
	            "end_date": "2023-11-05"
            }
        });

        if(response.status != 200){
          return null;
        }

        weather = response.data;
    } catch(error) {
        console.error(error);
        return null;
    }

    return {
      location: location.data,
      weather
    }
}


module.exports = {
  getFinances
}