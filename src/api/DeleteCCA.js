require('../db/mongoose')
const CCA = require('../models/CCAModel')

const deleteCCA = async (id) => {
    const del = CCA.findByIdAndDelete(id)
    return del
}

deleteCCA('5fccd4c5710408b5ded05dfc').then ((result)=>{
    console.log(result)
})