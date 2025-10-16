import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 60,
  },
  logo: {
    width: 120,
    height: 40,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  spacer: {
    width: 120,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 8,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    flex: 1,
  },
  successCell: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    color: '#000000',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  errorCell: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    color: '#000000',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  primaryCell: {
    backgroundColor: 'rgba(241, 90, 61, 0.1)',
    color: '#f15a3d',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  stateAverageCell: {
    backgroundColor: 'transparent',
    color: '#000000',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  legend: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    marginRight: 8,
    borderRadius: 2,
  },
})

interface PDFDocumentProps {
  data: {
    leadingIndicators: any[]
    classObservation: any[]
    laggingIndicators: any[]
  }
}

export const PDFDocument: React.FC<PDFDocumentProps> = ({ data }) => {
  const { leadingIndicators, classObservation, laggingIndicators } = data

  return (
    <Document>
      {/* Page 1: Leading Indicators */}
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.logo} src="/logo.png" />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Chattisgarh</Text>
            <Text style={styles.subtitle}>Real Time Classroom Observation 2025</Text>
          </View>
          <View style={styles.spacer} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leading Indicators (2025-26)</Text>
          <Text style={{ fontSize: 8, marginBottom: 10, color: '#666' }}>
            Average per school in the last 30 days
          </Text>
          
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: 2 }]}>District</Text>
              <Text style={styles.tableCell}>Teacher Acceptance</Text>
              <Text style={styles.tableCell}>Lessons Taught/Month</Text>
              <Text style={styles.tableCell}>Active Schools %</Text>
              <Text style={styles.tableCell}>Daily Usage (min)</Text>
              <Text style={styles.tableCell}># Teachers Trained</Text>
              <Text style={styles.tableCell}># Smart Schools</Text>
            </View>
            
            {leadingIndicators.map((row, index) => {
              const isStateAverage = row.district === "State Average/Total"
              return (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2, fontWeight: isStateAverage ? 'bold' : 'normal' }]}>
                    {row.district}
                  </Text>
                  <Text style={[styles.tableCell, getTeacherAcceptanceStyle(row.teacherAcceptance, isStateAverage)]}>
                    {row.teacherAcceptance.toFixed(1)}
                  </Text>
                  <Text style={[styles.tableCell, getLessonsTaughtStyle(row.lessonsTaught, isStateAverage)]}>
                    {row.lessonsTaught.toFixed(1)}
                  </Text>
                  <Text style={[styles.tableCell, getActiveSchoolsStyle(row.activeSchools, isStateAverage)]}>
                    {row.activeSchools}
                  </Text>
                  <Text style={[styles.tableCell, getDailyUsageStyle(row.dailyUsage, isStateAverage)]}>
                    {row.dailyUsage}
                  </Text>
                  <Text style={[styles.tableCell, getTeachersTrainedStyle(row.teachersTrained, isStateAverage)]}>
                    {row.teachersTrained.toLocaleString()}
                  </Text>
                  <Text style={[styles.tableCell, getSmartSchoolsStyle(row.smartSchools, isStateAverage)]}>
                    {row.smartSchools.toLocaleString()}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>
      </Page>

      {/* Page 2: Class Observation */}
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.logo} src="/logo.png" />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Chattisgarh</Text>
            <Text style={styles.subtitle}>Real Time Classroom Observation 2025</Text>
          </View>
          <View style={styles.spacer} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Class Observation (2025-26)</Text>
          <Text style={{ fontSize: 8, marginBottom: 10, color: '#666' }}>
            % of grade appropriate learners
          </Text>
          
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: 2 }]}>District</Text>
              <Text style={styles.tableCell}>Children Assessed</Text>
              <Text style={styles.tableCell}>% of Grade Appropriate Learners</Text>
            </View>
            
            {classObservation.map((row, index) => {
              const isStateAverage = row.district === "State Average/Total"
              return (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2, fontWeight: isStateAverage ? 'bold' : 'normal' }]}>
                    {row.district}
                  </Text>
                  <Text style={[styles.tableCell, isStateAverage ? styles.stateAverageCell : styles.tableCell]}>
                    {row.childrenAssessed.toLocaleString()}
                  </Text>
                  <Text style={[styles.tableCell, getGradeAppropriateStyle(row.gradeAppropriate, isStateAverage)]}>
                    {row.gradeAppropriate.toFixed(1)}%
                  </Text>
                </View>
              )
            })}
          </View>
        </View>
      </Page>

      {/* Page 3: Lagging Indicators */}
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.logo} src="/logo.png" />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Chattisgarh</Text>
            <Text style={styles.subtitle}>Real Time Classroom Observation 2025</Text>
          </View>
          <View style={styles.spacer} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lagging Indicators (2024-25)</Text>
          <Text style={{ fontSize: 8, marginBottom: 10, color: '#666' }}>
            % of Children achieving Base-level/End-level Competence
          </Text>
          
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: 2 }]}>District</Text>
              <Text style={styles.tableCell}>Math Base-level</Text>
              <Text style={styles.tableCell}>Math End-level</Text>
              <Text style={styles.tableCell}>Language Base-level</Text>
              <Text style={styles.tableCell}>Language End-level</Text>
            </View>
            
            {laggingIndicators.map((row, index) => {
              const isStateAverage = row.district === "State Average/Total"
              return (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2, fontWeight: isStateAverage ? 'bold' : 'normal' }]}>
                    {row.district}
                  </Text>
                  <Text style={[styles.tableCell, isStateAverage ? styles.stateAverageCell : getCellStyle(row.mathBase, 33.2)]}>
                    {row.mathBase.toFixed(1)}
                  </Text>
                  <Text style={[styles.tableCell, isStateAverage ? styles.stateAverageCell : getCellStyle(row.mathEnd, 74.7)]}>
                    {row.mathEnd.toFixed(1)}
                  </Text>
                  <Text style={[styles.tableCell, isStateAverage ? styles.stateAverageCell : getCellStyle(row.languageBase, 31.2)]}>
                    {row.languageBase.toFixed(1)}
                  </Text>
                  <Text style={[styles.tableCell, isStateAverage ? styles.stateAverageCell : getCellStyle(row.languageEnd, 74.9)]}>
                    {row.languageEnd.toFixed(1)}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>
      </Page>

      {/* Page 4: Performance Indicators Legend */}
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.logo} src="/logo.png" />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Chattisgarh</Text>
            <Text style={styles.subtitle}>Real Time Classroom Observation 2025</Text>
          </View>
          <View style={styles.spacer} />
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Performance Indicators</Text>
          
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#dcfce7' }]} />
            <Text>Above District Average</Text>
          </View>
          
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#fef2f2' }]} />
            <Text>Below District Average</Text>
          </View>
          
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#fef3f2' }]} />
            <Text>State Average/Total</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

// Helper function to determine cell styling based on value
function getCellStyle(value: number, average: number) {
  if (value > average) return styles.successCell
  if (value < average) return styles.errorCell
  return styles.primaryCell
}

// Custom color functions for specific values as per dashboard
function getTeacherAcceptanceStyle(value: number, isStateAverage: boolean) {
  if (isStateAverage) return styles.stateAverageCell
  return styles.successCell
}

function getLessonsTaughtStyle(value: number, isStateAverage: boolean) {
  if (isStateAverage) return styles.stateAverageCell
  // Only 3.9 and 2.2 are red, rest green
  if (value === 3.9 || value === 2.2) return styles.errorCell
  return styles.successCell
}

function getActiveSchoolsStyle(value: number, isStateAverage: boolean) {
  if (isStateAverage) return styles.stateAverageCell
  // 50, 42, 55, 26, 59, 51 are red, rest green
  const redValues = [50, 42, 55, 26, 59, 51]
  if (redValues.includes(value)) return styles.errorCell
  return styles.successCell
}

function getDailyUsageStyle(value: number, isStateAverage: boolean) {
  if (isStateAverage) return styles.stateAverageCell
  // 28 and 14 are red, rest green
  if (value === 28 || value === 14) return styles.errorCell
  return styles.successCell
}

function getTeachersTrainedStyle(value: number, isStateAverage: boolean) {
  if (isStateAverage) return styles.stateAverageCell
  // 0, 102, 26, 54, 67 are red, rest green
  const redValues = [0, 102, 26, 54, 67]
  if (redValues.includes(value)) return styles.errorCell
  return styles.successCell
}

function getGradeAppropriateStyle(value: number, isStateAverage: boolean) {
  if (isStateAverage) return styles.stateAverageCell
  // 61.7, 47.6, 50.7, 54.1 are green, rest red
  const greenValues = [61.7, 47.6, 50.7, 54.1]
  if (greenValues.includes(value)) return styles.successCell
  return styles.errorCell
}

function getSmartSchoolsStyle(value: number, isStateAverage: boolean) {
  // Always use transparent background for Smart Schools column
  return styles.stateAverageCell
}
