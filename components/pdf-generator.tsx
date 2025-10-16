'use client'

import React from 'react'
import { pdf } from '@react-pdf/renderer'
import { PDFDocument } from './pdf-document'

export async function generatePDF() {
  try {
    // Extract data from the DOM
    const data = {
      leadingIndicators: [
        { district: "State Average/Total", teacherAcceptance: 4.6, lessonsTaught: 6.8, activeSchools: 70, dailyUsage: 56, teachersTrained: 2925, smartSchools: 2130 },
        { district: "BALOD", teacherAcceptance: 4.7, lessonsTaught: 8.0, activeSchools: 84, dailyUsage: 61, teachersTrained: 109, smartSchools: 60 },
        { district: "BALODABAZAR", teacherAcceptance: 4.7, lessonsTaught: 5.3, activeSchools: 50, dailyUsage: 43, teachersTrained: 0, smartSchools: 139 },
        { district: "BASTER", teacherAcceptance: 4.7, lessonsTaught: 6.1, activeSchools: 61, dailyUsage: 54, teachersTrained: 102, smartSchools: 310 },
        { district: "BIJAPUR", teacherAcceptance: 4.5, lessonsTaught: 3.9, activeSchools: 42, dailyUsage: 28, teachersTrained: 26, smartSchools: 40 },
        { district: "BILASPUR", teacherAcceptance: 4.6, lessonsTaught: 6.8, activeSchools: 73, dailyUsage: 64, teachersTrained: 132, smartSchools: 107 },
        { district: "DANTEWADA", teacherAcceptance: 4.8, lessonsTaught: 5.2, activeSchools: 55, dailyUsage: 45, teachersTrained: 54, smartSchools: 79 },
        { district: "DURG", teacherAcceptance: 4.6, lessonsTaught: 2.2, activeSchools: 26, dailyUsage: 14, teachersTrained: 0, smartSchools: 70 },
        { district: "JASHPUR", teacherAcceptance: 4.7, lessonsTaught: 8.4, activeSchools: 90, dailyUsage: 66, teachersTrained: 133, smartSchools: 74 },
        { district: "KHAIRAGARH", teacherAcceptance: 4.6, lessonsTaught: 6.3, activeSchools: 64, dailyUsage: 57, teachersTrained: 67, smartSchools: 101 },
        { district: "MUNGELI", teacherAcceptance: 4.6, lessonsTaught: 6.0, activeSchools: 59, dailyUsage: 59, teachersTrained: 88, smartSchools: 56 },
        { district: "RAIPUR", teacherAcceptance: 4.6, lessonsTaught: 4.7, activeSchools: 51, dailyUsage: 36, teachersTrained: 215, smartSchools: 224 },
        { district: "RAJNANDGAON", teacherAcceptance: 4.5, lessonsTaught: 7.6, activeSchools: 77, dailyUsage: 61, teachersTrained: 2000, smartSchools: 870 },
      ],
      classObservation: [
        { district: "State Average/Total", childrenAssessed: 6107, gradeAppropriate: 47.6 },
        { district: "BALOD", childrenAssessed: 138, gradeAppropriate: 22.5 },
        { district: "BALODABAZAR", childrenAssessed: 595, gradeAppropriate: 38.7 },
        { district: "BASTER", childrenAssessed: 102, gradeAppropriate: 43.1 },
        { district: "BIJAPUR", childrenAssessed: 162, gradeAppropriate: 61.7 },
        { district: "BILASPUR", childrenAssessed: 210, gradeAppropriate: 47.6 },
        { district: "DANTEWADA", childrenAssessed: 551, gradeAppropriate: 43.9 },
        { district: "DURG", childrenAssessed: 101, gradeAppropriate: 12.9 },
        { district: "JASHPUR", childrenAssessed: 26, gradeAppropriate: 7.7 },
        { district: "KHAIRAGARH", childrenAssessed: 349, gradeAppropriate: 24.9 },
        { district: "MUNGELI", childrenAssessed: 136, gradeAppropriate: 47.1 },
        { district: "RAIPUR", childrenAssessed: 744, gradeAppropriate: 50.7 },
        { district: "RAJNANDGAON", childrenAssessed: 2993, gradeAppropriate: 54.1 },
      ],
      laggingIndicators: [
        { district: "State Average/Total", mathBase: 33.2, mathEnd: 74.7, languageBase: 31.2, languageEnd: 74.9 },
        { district: "BALODABAZAR", mathBase: 34.0, mathEnd: 71.1, languageBase: 31.4, languageEnd: 75.9 },
        { district: "DANTEWADA", mathBase: 38.8, mathEnd: 92.7, languageBase: 37.2, languageEnd: 85.8 },
        { district: "KHAIRAGARH", mathBase: 26.5, mathEnd: 75.9, languageBase: 24.6, languageEnd: 64.6 },
        { district: "JASHPUR", mathBase: 30.6, mathEnd: 53.0, languageBase: 28.6, languageEnd: 54.6 },
        { district: "RAIPUR", mathBase: 32.9, mathEnd: 86.8, languageBase: 30.4, languageEnd: 87.8 },
        { district: "RAJNANDGAON", mathBase: 36.5, mathEnd: 65.8, languageBase: 35.1, languageEnd: 80.7 },
      ]
    }

    // Generate PDF blob
    const blob = await pdf(React.createElement(PDFDocument, { data })).toBlob()
    
    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'chattisgarh-classroom-observation-2025.pdf'
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up
    URL.revokeObjectURL(url)
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF')
  }
}
