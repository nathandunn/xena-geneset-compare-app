import axios from 'axios'
import {getCohortDetails} from '../functions/CohortFunctions'
import {average} from '../functions/DataFunctions'


export function generateTpmDownloadUrlFromCohorts(cohorts){
  return [
    {
      name: cohorts[0].name,
      url: generateTpmFromCohort(cohorts[0]),
    },
    {
      name: cohorts[1].name,
      url: generateTpmFromCohort(cohorts[1]),
    },
  ]
}

function generateTpmFromCohort(cohort){
  const selectedCohort = getCohortDetails(cohort)
  return `${selectedCohort['geneExpression'].host}/download/${selectedCohort['geneExpression'].dataset}.gz`
}

/**
 * Emulating:  curl -v -F tpmdata=@test-data/TCGA-CHOL_logtpm_forTesting.tsv -F gmtdata=@test-data/Xena_manual_pathways.gmt http://localhost:8000/bpa_analysis
 * @param cohort
 * @param gmtData
 * @param geneSetName
 * @returns {Promise<{msg: ({"TCGA.3X.AAV9.01A.TCGA.3X.AAVA.01A.TCGA.3X.AAVB.01A.TCGA.3X.AAVC.01A.TCGA.3X.AAVE.01A.TCGA.4G.AAZO.01A.TCGA.4G.AAZT.01A.TCGA.W5.AA2G.01A.TCGA.W5.AA2H.01A.TCGA.W5.AA2I.01A": string}|{"TCGA.3X.AAV9.01A.TCGA.3X.AAVA.01A.TCGA.3X.AAVB.01A.TCGA.3X.AAVC.01A.TCGA.3X.AAVE.01A.TCGA.4G.AAZO.01A.TCGA.4G.AAZT.01A.TCGA.W5.AA2G.01A.TCGA.W5.AA2H.01A.TCGA.W5.AA2I.01A": string}|{"TCGA.3X.AAV9.01A.TCGA.3X.AAVA.01A.TCGA.3X.AAVB.01A.TCGA.3X.AAVC.01A.TCGA.3X.AAVE.01A.TCGA.4G.AAZO.01A.TCGA.4G.AAZT.01A.TCGA.W5.AA2G.01A.TCGA.W5.AA2H.01A.TCGA.W5.AA2I.01A": string}|{"TCGA.3X.AAV9.01A.TCGA.3X.AAVA.01A.TCGA.3X.AAVB.01A.TCGA.3X.AAVC.01A.TCGA.3X.AAVE.01A.TCGA.4G.AAZO.01A.TCGA.4G.AAZT.01A.TCGA.W5.AA2G.01A.TCGA.W5.AA2H.01A.TCGA.W5.AA2I.01A": string}|{"TCGA.3X.AAV9.01A.TCGA.3X.AAVA.01A.TCGA.3X.AAVB.01A.TCGA.3X.AAVC.01A.TCGA.3X.AAVE.01A.TCGA.4G.AAZO.01A.TCGA.4G.AAZT.01A.TCGA.W5.AA2G.01A.TCGA.W5.AA2H.01A.TCGA.W5.AA2I.01A": string})[]}>}
 */
export async function doBpaAnalysisForCohorts(cohort, gmtData, geneSetName){

  // const tpmData = generateTpmFromCohort(cohort)
  // let formData = new FormData()
  // formData.append('gmtdata',gmtData)
  // formData.append('tpmname',cohort.name)
  // formData.append('tpmurl',generateTpmFromCohort(cohort))
  let formData = {}
  formData['gmtdata'] = gmtData
  formData['gmtname'] = geneSetName
  formData['cohort'] = cohort.name
  formData['tpmurl'] = generateTpmFromCohort(cohort)
  formData['method'] = 'BPA'
  // formData.append('input','text')
  const response = await axios.post('http://localhost:3001/analyze',
    formData,
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }
  )
  const { data} = response

  return data

}

export function getZValues(data,mean,variance){
  return data.map( d => (d - mean) / variance )
}

export function getDataStatisticsForGeneSet(arr){
  function getVariance(arr, mean) {
    return arr.reduce(function(pre, cur) {
      pre = pre + Math.pow((cur - mean), 2)
      return pre
    }, 0)
  }

  const meanTot = arr.reduce(function(pre, cur) {
    return pre + cur
  })
  const total = getVariance(arr, meanTot / arr.length)

  return {
    mean:meanTot / arr.length,
    variance: total / arr.length,
  }
}

export function getGeneSetNames(data){
  return data.data.map( d => {
    const name = d.geneset
    const goIndex = name.indexOf('(GO:')
    return goIndex > 0 ? name.substr(0,goIndex).trim() : name.trim()
  })
}

export function getValuesForCohort(data){
  return data.data
}

export function getValues(data){
  return [getValuesForCohort(data[0]),getValuesForCohort(data[1])]
}

/**
 * We assume that both the cohorts have been glued together.
 * @param data
 * @returns {*}
 */
export function getDataStatisticsPerGeneSet(data){
  const dataA = data[0]
  const dataB = data[1]
  let outputData = []
  for( const i in dataA){
    const values = dataA[i].data.concat(dataB[i].data)
    const {mean, variance} = getDataStatisticsForGeneSet(values)
    outputData.push({mean,variance})
  }
  return outputData
}


export function getSamples(data){
  // return Object.keys(data[0]).filter( k => k!=='X' )
  return data.samples
}

export function getValuesForGeneSet(data){
  // return Object.entries(data).filter( k => k[0]!=='X' ).map( d => d[1])
  return data.data
}


export function getZSampleScores(values,dataStatisticsPerGeneSet){
  let scoreValues = []
  for( let index in values){
    const { mean, variance} = dataStatisticsPerGeneSet[index]
    const array = values[index].data.map( v => (v - mean)/ variance )
    scoreValues.push(array)
  }
  return scoreValues
}

export function getZPathwayScoresForCohort(sampleScores){
  return sampleScores.map( d => {
    return average(d)
  })

}

// eslint-disable-next-line no-unused-vars
export function getZPathwayScores(sampleZScores){
  return [getZPathwayScoresForCohort(sampleZScores[0]),getZPathwayScoresForCohort(sampleZScores[1])]
}

export function createMeanMap(analyzedData) {
  const samples = [getSamples(analyzedData[0]),getSamples(analyzedData[1])]

  const geneSetNames = getGeneSetNames(analyzedData[0])
  const values = getValues(analyzedData)
  const dataStatisticsPerGeneSet = getDataStatisticsPerGeneSet(values)
  // calculates cohorts separately
  const zSampleScores = [getZSampleScores(values[0],dataStatisticsPerGeneSet),getZSampleScores(values[1],dataStatisticsPerGeneSet)]
  // uses mean separately
  const zPathwayScores = getZPathwayScores(zSampleScores)

  return {
    samples,
    zSampleScores,
    zPathwayScores,
    geneSetNames
  }
}

export function calculateCustomGeneSetActivity( gmtData, analyzedData){
  const meanMap = createMeanMap(analyzedData)
  // console.log('mean map')
  // console.log(meanMap)
  return gmtData.split('\n')
    .filter( l => l.split('\t').length>2)
    .map( line => {
      const entries = line.split('\t')

      // we need to handle the space encoding
      // this fails test due to an outdated library I think
      let keyIndex = meanMap.geneSetNames.indexOf(entries[0])
      keyIndex = keyIndex >=0 ? keyIndex : meanMap.geneSetNames.indexOf(`${entries[0]} (${entries[1]})` )
      // console.log('key index',keyIndex,'entries',entries[0],'entries 1',entries[1],entries[0] + ' ' + entries[1])
      return {
        golabel: entries[0],
        goid: entries[1],
        gene: entries.slice(2),
        firstSamples: meanMap.samples[0], // TODO: probably a better way to handle this
        secondSamples: meanMap.samples[1],
        firstGeneExpressionPathwayActivity: meanMap.zPathwayScores[0][keyIndex],
        secondGeneExpressionPathwayActivity: meanMap.zPathwayScores[1][keyIndex],
        firstGeneExpressionSampleActivity: meanMap.zSampleScores[0][keyIndex],
        secondGeneExpressionSampleActivity: meanMap.zSampleScores[1][keyIndex],
      }
    } )
}



