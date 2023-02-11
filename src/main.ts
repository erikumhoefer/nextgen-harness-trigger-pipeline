import * as core from '@actions/core'
import {wait} from './wait'
import * as http from '@actions/http-client'


async function sendRequest(url: string, payloadObject: object, harnessApiKey: string, isYaml: boolean=false): Promise<string> {
  let client = new http.HttpClient()
  var contentType = ((isYaml) ? "application/yaml" : "application/json")
  var headers = {
    "x-api-key": harnessApiKey,
    "Content-Type": contentType,
    [http.Headers.Accept]: "application/json"
  };

  var jsonPayload = JSON.stringify(payloadObject);
  var responseJson: string = "";
  (async () => {
    const response: http.HttpClientResponse = await client.post(url, jsonPayload)
    const responseBody: string = await response.readBody()
    core.debug(`Status: ${response.message.statusCode}`)
    core.debug(`Response: ${responseBody}`)
    responseJson = responseBody
  })
  return responseJson
}

async function run(): Promise<void> {
  try {
    const harnessApiKey: string = core.getInput('harnessApiKey')
    const pipelineIdentifier: string = core.getInput('pipelineIdentifier')
    const accountIdentifier: string = core.getInput('accountIdentifier')
    const orgIdentifier: string = core.getInput('orgIdentifier')
    const projectIdentifier: string = core.getInput('projectIdentifier')
    var inputSetListString: string = core.getInput('inputSetList')
    var inputSetList = inputSetListString.split(",")
    const stageIdentifiersString: string = core.getInput('stageIdentifiers')
    var stageIdentifierList = stageIdentifiersString.split(",")
    const triggerIdentifier: string = core.getInput('triggerIdentifier')
    const triggerPayload: string = core.getInput('triggerPayload')

    // Switch to URL type?
    var harnessApiUrl = "https://app.harness.io/gateway/pipeline/api/"
    if (inputSetListString) {
      core.debug("inputSetList parameter provided, using pipeline/execute/{identifier}/inputSetList API endpoint.")
      harnessApiUrl += `execute/${pipelineIdentifier}/inputSetList`
      var payloadObject: any = { };
      payloadObject.inputSetReferenecs = inputSetList

      if (stageIdentifiersString) {
        payloadObject.stageIdentifiers = stageIdentifierList
      }

      var response = await sendRequest(harnessApiUrl, payloadObject, harnessApiKey)
    }

    await wait(1)

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}


run()
