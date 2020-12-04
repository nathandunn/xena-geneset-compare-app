import {AppStorageHandler} from '../service/AppStorageHandler'
import {getCohortDetails, getSubCohortsOnlyForCohort} from './CohortFunctions'
import {SORT_VIEW_BY} from '../data/SortEnum'
import {calculateSortingByMethod} from './SortFunctions'

export function calculateFilter(urlVariables){
  // handling filters
  if(urlVariables.filter){
    AppStorageHandler.storeFilterState(urlVariables.filter)
  }
  return AppStorageHandler.getFilterState()
}


export function calculateGeneSet(urlVariables,pathways){
  // handle selected Pathway / GeneSet
  let selectedGeneSet = undefined
  if(urlVariables.geneset){
    // find a geneset for the name
    const geneset = pathways.find( p => p.golabel === urlVariables.geneset )
    if(geneset){
      selectedGeneSet = {
        open: urlVariables.genesetOpen === 'true' ,
        pathway: geneset,
        tissue: 'Header'
      }
    }
    else{
      // if specified before calculated, we get this, geneset not found
      selectedGeneSet = {
        open: urlVariables.genesetOpen === 'true',
        pathway: {
          goid: undefined,
          golabel:urlVariables.geneset,
          gene: [],
        },
        tissue: 'Header'
      }
    }
    AppStorageHandler.storePathwaySelection(selectedGeneSet)
  }
  return selectedGeneSet
}

export function calculateSorting(urlVariables){
  const sortViewByLabel= urlVariables.sortViewByLabel ?urlVariables.sortViewByLabel : SORT_VIEW_BY.DIFFERENT
  return calculateSortingByMethod(sortViewByLabel)
}

export function calculateCohortColors(urlVariables){

  if(urlVariables.cohort1Color && urlVariables.cohort2Color){
    return [urlVariables.cohort1Color,urlVariables.cohort2Color]
  }
  return ['darkolivegreen','tan']

}

export function calculateCohorts(urlVariables){
  // // handle selected cohorts
  if(urlVariables.cohort1){
    let cohort1Details = getCohortDetails({name: urlVariables.cohort1})
    cohort1Details.subCohorts = getSubCohortsOnlyForCohort(urlVariables.cohort1)
    cohort1Details.selectedSubCohorts = urlVariables.selectedSubCohorts1 ? urlVariables.selectedSubCohorts1.split(',') : cohort1Details.subCohorts
    AppStorageHandler.storeCohortState(cohort1Details,0)
  }
  if(urlVariables.cohort2){
    const cohort2Details = getCohortDetails({name: urlVariables.cohort2})
    cohort2Details.subCohorts = getSubCohortsOnlyForCohort(urlVariables.cohort2)
    cohort2Details.selectedSubCohorts = urlVariables.selectedSubCohorts2 ? urlVariables.selectedSubCohorts2.split(',') : cohort2Details.subCohorts
    AppStorageHandler.storeCohortState(cohort2Details,1)
  }
  // handle selected subCohorts
  return [ AppStorageHandler.getCohortState(0), AppStorageHandler.getCohortState(1)]
}

export const generateUrl = (filter,geneset,genesetOpen,cohort1,cohort2,selectedSubCohorts1,selectedSubCohorts2,limit,sortViewByLabel,selectedGeneSets) => {
  let generatedUrl = `cohort1=${cohort1}`
  generatedUrl += `&cohort2=${cohort2}`
  generatedUrl += `&filter=${filter}`
  generatedUrl += `&geneset=${geneset}`
  generatedUrl += `&genesetOpen=${genesetOpen ? genesetOpen : false }`
  if( selectedSubCohorts1){
    generatedUrl += `&selectedSubCohorts1=${selectedSubCohorts1}`
  }
  if( selectedSubCohorts2){
    generatedUrl += `&selectedSubCohorts2=${selectedSubCohorts2}`
  }
  if(limit){
    generatedUrl += `&geneSetLimit=${limit}`
  }
  if(sortViewByLabel){
    generatedUrl += `&sortViewByLabel=${sortViewByLabel}`
  }
  if(selectedGeneSets){
    generatedUrl += `&selectedGeneSets=${selectedGeneSets}`
  }
  return generatedUrl
}
